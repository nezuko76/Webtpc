package com.thucphamsach.backend_ecommerce.controller;

import com.thucphamsach.backend_ecommerce.dto.request.ReviewRequest;
import com.thucphamsach.backend_ecommerce.dto.response.*;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import com.thucphamsach.backend_ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(productId, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(reviewService.createReview(userId, productId, request), "Đánh giá thành công"));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(reviewService.updateReview(userId, reviewId, request)));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @PathVariable Long reviewId) {
        Long userId = getUserId(userDetails);
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return user.getId();
    }
}
