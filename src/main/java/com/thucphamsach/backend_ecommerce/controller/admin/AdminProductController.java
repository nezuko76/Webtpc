package com.thucphamsach.backend_ecommerce.controller.admin;

import com.thucphamsach.backend_ecommerce.dto.request.ProductRequest;
import com.thucphamsach.backend_ecommerce.dto.response.*;
import com.thucphamsach.backend_ecommerce.repository.ProductRepository;
import com.thucphamsach.backend_ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<com.thucphamsach.backend_ecommerce.enity.Product> productPage =
            productRepository.findAll(PageRequest.of(page, size,
                Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(
            PageResponse.<ProductResponse>builder()
                .content(productPage.getContent().stream()
                    .map(productService::toResponse).toList())
                .page(page).size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build()));
    }

    // JSON endpoint — no images (create) — accepts both /json and plain POST with JSON body
    @PostMapping(value = {"/json", ""}, consumes = "application/json")
    public ResponseEntity<ApiResponse<ProductResponse>> createJson(
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.createProduct(request, (List<MultipartFile>) null)));
    }

    // JSON endpoint — no images (update) — accepts both /{id}/json and plain PUT with JSON body
    @PutMapping(value = {"/{id}/json", "/{id}"}, consumes = "application/json")
    public ResponseEntity<ApiResponse<ProductResponse>> updateJson(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.updateProduct(id, request)));
    }

    // Multipart endpoint (create with images)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @RequestParam("name") String name,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "originalPrice", required = false) String originalPrice,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "certifications", required = false) String certifications,
            @RequestParam(value = "origin", required = false) String origin,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "isFeatured", required = false) String isFeatured,
            @RequestParam(value = "isActive", required = false) String isActive,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        ProductRequest req = buildRequest(name, categoryId, price, originalPrice,
            stockQuantity, description, certifications, origin, unit, isFeatured, isActive);
        return ResponseEntity.ok(ApiResponse.success(
            productService.createProduct(req, filterImages(images))));
    }

    // Multipart endpoint (update with optional images)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "originalPrice", required = false) String originalPrice,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "certifications", required = false) String certifications,
            @RequestParam(value = "origin", required = false) String origin,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "isFeatured", required = false) String isFeatured,
            @RequestParam(value = "isActive", required = false) String isActive,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        ProductRequest req = buildRequest(name, categoryId, price, originalPrice,
            stockQuantity, description, certifications, origin, unit, isFeatured, isActive);
        return ResponseEntity.ok(ApiResponse.success(
            productService.updateProduct(id, req, filterImages(images))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success(
            productRepository.findLowStockProducts()
                .stream().map(productService::toResponse).toList()));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> uploadImages(
            @PathVariable Long id,
            @RequestParam List<MultipartFile> images) {
        return ResponseEntity.ok(ApiResponse.success(
            productService.addImages(id, filterImages(images))));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long imageId) {
        productService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private ProductRequest buildRequest(String name, Long categoryId, BigDecimal price,
            String originalPrice, Integer stockQuantity, String description,
            String certifications, String origin, String unit,
            String isFeatured, String isActive) {
        ProductRequest req = new ProductRequest();
        req.setName(name);
        req.setCategoryId(categoryId);
        req.setPrice(price);
        if (originalPrice != null && !originalPrice.isBlank())
            req.setOriginalPrice(new BigDecimal(originalPrice));
        req.setStockQuantity(stockQuantity);
        req.setDescription(description);
        req.setCertifications(certifications);
        req.setOrigin(origin);
        req.setUnit(unit);
        req.setFeatured("true".equalsIgnoreCase(isFeatured));
        req.setActive(isActive == null || "true".equalsIgnoreCase(isActive));
        return req;
    }

    private List<MultipartFile> filterImages(List<MultipartFile> images) {
        if (images == null) return null;
        List<MultipartFile> filtered = images.stream()
            .filter(f -> f != null && !f.isEmpty())
            .toList();
        return filtered.isEmpty() ? null : filtered;
    }
}
