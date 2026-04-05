package com.thucphamsach.backend_ecommerce.controller.admin;

import com.thucphamsach.backend_ecommerce.dto.response.ApiResponse;
import com.thucphamsach.backend_ecommerce.dto.response.PageResponse;
import com.thucphamsach.backend_ecommerce.dto.response.ReviewResponse;
import com.thucphamsach.backend_ecommerce.enity.Review;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.ReviewRepository;
import com.thucphamsach.backend_ecommerce.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<Review> reviewPage = reviewRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        PageResponse<ReviewResponse> response = PageResponse.<ReviewResponse>builder()
                .content(reviewPage.getContent().stream().map(reviewService::toResponse).toList())
                .page(page)
                .size(size)
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .last(reviewPage.isLast())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/visibility")
    public ResponseEntity<ApiResponse<Void>> toggleVisibility(@PathVariable Long id) {
        reviewService.toggleVisibility(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
    }
}
