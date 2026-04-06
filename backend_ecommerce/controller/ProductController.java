package com.thucphamsach.backend_ecommerce.controller;

import com.thucphamsach.backend_ecommerce.dto.request.ProductRequest;
import com.thucphamsach.backend_ecommerce.dto.response.*;
import com.thucphamsach.backend_ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.getProducts(categoryId, search, minPrice, maxPrice, page, size, sort)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getRelated(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getRelatedProducts(id)));
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @RequestParam("name") String name,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "originalPrice", required = false) BigDecimal originalPrice,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "certifications", required = false) String certifications,
            @RequestParam(value = "origin", required = false) String origin,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "isFeatured", defaultValue = "false") boolean isFeatured,
            @RequestParam(value = "isActive", defaultValue = "true") boolean isActive,
            @RequestPart("image") MultipartFile image
    ) {
        ProductRequest request = new ProductRequest();
        request.setName(name);
        request.setCategoryId(categoryId);
        request.setPrice(price);
        request.setOriginalPrice(originalPrice);
        request.setStockQuantity(stockQuantity);
        request.setDescription(description);
        request.setCertifications(certifications);
        request.setOrigin(origin);
        request.setUnit(unit);
        request.setFeatured(isFeatured);
        request.setActive(isActive);

        return ResponseEntity.ok(ApiResponse.success(productService.createProduct(request, image), "Tạo sản phẩm thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa sản phẩm thành công"));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> addImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.success(productService.addImages(id, files)));
    }

    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long imageId) {
        productService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa ảnh thành công"));
    }
}
