package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.request.ProductRequest;
import com.thucphamsach.backend_ecommerce.dto.response.PageResponse;
import com.thucphamsach.backend_ecommerce.dto.response.ProductResponse;
import com.thucphamsach.backend_ecommerce.enity.*;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository;
    private final FileUploadService fileUploadService;

    public PageResponse<ProductResponse> getProducts(Long categoryId, String search,
                                                      BigDecimal minPrice, BigDecimal maxPrice,
                                                      int page, int size, String sort) {
        Sort sortObj = switch (sort != null ? sort : "") {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "newest" -> Sort.by("createdAt").descending();
            case "popular" -> Sort.by("soldCount").descending();
            default -> Sort.by("createdAt").descending();
        };
        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Product> result = productRepository.findWithFilters(categoryId, search, minPrice, maxPrice, pageable);
        return PageResponse.<ProductResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    public ProductResponse getProductById(Long id) {
        return toResponse(findById(id));
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue()
                .stream().map(this::toResponse).toList();
    }

    public List<ProductResponse> getRelatedProducts(Long productId) {
        Product product = findById(productId);
        Pageable pageable = PageRequest.of(0, 6);
        return productRepository.findByCategoryIdAndIsActiveTrueAndIdNot(
                        product.getCategory().getId(), productId, pageable)
                .stream().map(this::toResponse).toList();
    }

    public ProductResponse createProduct(ProductRequest request, MultipartFile image) {
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
        Product product = Product.builder()
            .name(request.getName())
            .category(category)
            .price(request.getPrice())
            .originalPrice(request.getOriginalPrice())
            .stockQuantity(request.getStockQuantity())
            .description(request.getDescription())
            .certifications(request.getCertifications())
            .origin(request.getOrigin())
            .unit(request.getUnit())
            .isFeatured(request.isFeatured())
            .isActive(request.isActive())
            .build();
        Product saved = productRepository.save(product);
        if (image != null && !image.isEmpty()) {
            String url = fileUploadService.uploadImage(image);
            ProductImage img = ProductImage.builder()
                .product(saved)
                .imageUrl(url)
                .isPrimary(true)
                .sortOrder(0)
                .build();
            productImageRepository.save(img);
        }
        return toResponse(productRepository.findById(saved.getId()).orElseThrow());
    }

    public ProductResponse createProduct(ProductRequest request, List<MultipartFile> images) {
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
        Product product = Product.builder()
            .name(request.getName())
            .category(category)
            .price(request.getPrice())
            .originalPrice(request.getOriginalPrice())
            .stockQuantity(request.getStockQuantity())
            .description(request.getDescription())
            .certifications(request.getCertifications())
            .origin(request.getOrigin())
            .unit(request.getUnit())
            .isFeatured(request.isFeatured())
            .isActive(request.isActive())
            .build();
        Product saved = productRepository.save(product);
        if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile f = images.get(i);
                if (f != null && !f.isEmpty()) {
                    String url = fileUploadService.uploadImage(f);
                    ProductImage img = ProductImage.builder()
                        .product(saved)
                        .imageUrl(url)
                        .isPrimary(i == 0)
                        .sortOrder(i)
                        .build();
                    productImageRepository.save(img);
                }
            }
        }
        return toResponse(productRepository.findById(saved.getId()).orElseThrow());
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
        product.setName(request.getName());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDescription(request.getDescription());
        product.setCertifications(request.getCertifications());
        product.setOrigin(request.getOrigin());
        product.setUnit(request.getUnit());
        product.setFeatured(request.isFeatured());
        product.setActive(request.isActive());
        return toResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(Long id, ProductRequest request, List<MultipartFile> newImages) {
        Product product = findById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));

        product.setName(request.getName());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setDescription(request.getDescription());
        product.setCertifications(request.getCertifications());
        product.setOrigin(request.getOrigin());
        product.setUnit(request.getUnit());
        product.setFeatured(request.isFeatured());
        product.setActive(request.isActive());

        // Chỉ xóa và thay ảnh nếu có upload ảnh mới
        if (newImages != null && !newImages.isEmpty()) {
            // Xóa ảnh cũ
            product.getImages().forEach(img -> fileUploadService.deleteImage(img.getImageUrl()));
            product.getImages().clear();
            // Thêm ảnh mới
            for (int i = 0; i < newImages.size(); i++) {
                String url = fileUploadService.uploadImage(newImages.get(i));
                product.getImages().add(ProductImage.builder()
                        .product(product).imageUrl(url)
                        .isPrimary(i == 0).sortOrder(i).build());
            }
        }
        // Nếu không upload ảnh mới → giữ nguyên ảnh cũ

        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = findById(id);
        product.getImages().forEach(img -> fileUploadService.deleteImage(img.getImageUrl()));
        productRepository.delete(product);
    }

    public ProductResponse addImages(Long productId, List<MultipartFile> files) {
        Product product = findById(productId);
        boolean hasImages = !product.getImages().isEmpty();
        for (int i = 0; i < files.size(); i++) {
            String url = fileUploadService.uploadImage(files.get(i));
            ProductImage img = ProductImage.builder()
                    .product(product)
                    .imageUrl(url)
                    .isPrimary(!hasImages && i == 0)
                    .sortOrder(product.getImages().size() + i)
                    .build();
            productImageRepository.save(img);
        }
        return toResponse(productRepository.findById(productId).orElseThrow());
    }

    public void deleteImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh"));
        fileUploadService.deleteImage(image.getImageUrl());
        productImageRepository.delete(image);
    }

    // ===== ALIAS METHODS (cho AdminProductController) =====
    public ProductResponse create(ProductRequest request, List<MultipartFile> images) {
        return createProduct(request, images);
    }

    public ProductResponse update(Long id, ProductRequest request, List<MultipartFile> images) {
        return updateProduct(id, request, images);
    }

    public void delete(Long id) {
        deleteProduct(id);
    }

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));
    }

    public ProductResponse toResponse(Product p) {
        List<String> imageUrls = p.getImages().stream().map(ProductImage::getImageUrl).toList();
        String primaryUrl = p.getImages().stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(imageUrls.isEmpty() ? null : imageUrls.get(0));
        Double avgRating = reviewRepository.getAverageRatingByProductId(p.getId());
        Long reviewCount = reviewRepository.countByProductId(p.getId());
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .stockQuantity(p.getStockQuantity())
                .certifications(p.getCertifications())
                .origin(p.getOrigin())
                .unit(p.getUnit())
                .isActive(p.isActive())
                .isFeatured(p.isFeatured())
                .soldCount(p.getSoldCount())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .imageUrls(imageUrls)
                .primaryImageUrl(primaryUrl)
                .averageRating(avgRating)
                .reviewCount(reviewCount)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
