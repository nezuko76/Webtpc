package com.thucphamsach.backend_ecommerce.controller.admin;

import com.thucphamsach.backend_ecommerce.dto.request.CategoryRequest;
import com.thucphamsach.backend_ecommerce.dto.response.*;
import com.thucphamsach.backend_ecommerce.exception.BusinessException;
import com.thucphamsach.backend_ecommerce.repository.ProductRepository;
import com.thucphamsach.backend_ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "sortOrder", defaultValue = "0") int sortOrder,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setDescription(description);
        request.setSortOrder(sortOrder);
        request.setActive(true);
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.createCategory(request, image),
                "Tạo danh mục thành công"));
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "sortOrder", defaultValue = "0") int sortOrder,
            @RequestParam(value = "isActive", defaultValue = "true") String isActive,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        CategoryRequest request = new CategoryRequest();
        request.setName(name);
        request.setDescription(description);
        request.setSortOrder(sortOrder);
        request.setActive("true".equalsIgnoreCase(isActive));
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.updateCategory(id, request, image)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        // Kiểm tra có sản phẩm không
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BusinessException(
                "Không thể xóa danh mục đang có " + productCount + " sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.");
        }
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa danh mục thành công"));
    }
}
