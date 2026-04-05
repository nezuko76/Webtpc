package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.request.CategoryRequest;
import com.thucphamsach.backend_ecommerce.dto.response.CategoryResponse;
import com.thucphamsach.backend_ecommerce.enity.Category;
import com.thucphamsach.backend_ecommerce.exception.BusinessException;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FileUploadService fileUploadService;

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toResponse).toList();
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findById(id));
    }

    public CategoryResponse createCategory(CategoryRequest request, MultipartFile image) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BusinessException("Tên danh mục đã tồn tại");
        }

        // Đẩy các category có sortOrder >= sortOrder lên 1
        List<Category> toShift = categoryRepository.findAll().stream()
                .filter(c -> c.getSortOrder() >= request.getSortOrder())
                .collect(java.util.stream.Collectors.toList());
        for (Category c : toShift) {
            c.setSortOrder(c.getSortOrder() + 1);
            categoryRepository.save(c);
        }

        String slug = generateSlug(request.getName());
        String imageUrl = image != null && !image.isEmpty() ? fileUploadService.uploadImage(image) : null;
        Category category = Category.builder()
                .name(request.getName()).slug(slug).description(request.getDescription())
                .sortOrder(request.getSortOrder()).isActive(request.isActive()).imageUrl(imageUrl).build();
        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile image) {
        Category category = findById(id);
        
        int oldSortOrder = category.getSortOrder();
        int newSortOrder = request.getSortOrder();
        
        // Xử lý thay đổi thứ tự
        if (newSortOrder != oldSortOrder) {
            List<Category> others = categoryRepository.findAll().stream()
                    .filter(c -> !c.getId().equals(id))
                    .collect(java.util.stream.Collectors.toList());
            
            if (newSortOrder < oldSortOrder) {
                // Di chuyển lên → đẩy các category từ newSortOrder đến oldSortOrder-1 xuống 1
                others.stream()
                    .filter(c -> c.getSortOrder() >= newSortOrder && c.getSortOrder() < oldSortOrder)
                    .forEach(c -> {
                        c.setSortOrder(c.getSortOrder() + 1);
                        categoryRepository.save(c);
                    });
            } else {
                // Di chuyển xuống → đẩy các category từ oldSortOrder+1 đến newSortOrder lên 1
                others.stream()
                    .filter(c -> c.getSortOrder() > oldSortOrder && c.getSortOrder() <= newSortOrder)
                    .forEach(c -> {
                        c.setSortOrder(c.getSortOrder() - 1);
                        categoryRepository.save(c);
                    });
            }
        }
        
        category.setName(request.getName());
        category.setSlug(generateSlug(request.getName()));
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());
        category.setSortOrder(newSortOrder);
        if (image != null && !image.isEmpty()) {
            if (category.getImageUrl() != null) fileUploadService.deleteImage(category.getImageUrl());
            category.setImageUrl(fileUploadService.uploadImage(image));
        }
        return toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = findById(id);
        if (!category.getProducts().isEmpty()) {
            throw new BusinessException("Không thể xóa danh mục đang có sản phẩm");
        }
        categoryRepository.delete(category);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục"));
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .isActive(c.isActive())
                .sortOrder(c.getSortOrder())
                .productCount((long) c.getProducts().size())
                .build();
    }

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
