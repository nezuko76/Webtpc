package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.request.ReviewRequest;
import com.thucphamsach.backend_ecommerce.dto.response.PageResponse;
import com.thucphamsach.backend_ecommerce.dto.response.ReviewResponse;
import com.thucphamsach.backend_ecommerce.enity.Product;
import com.thucphamsach.backend_ecommerce.enity.Review;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.exception.BusinessException;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.ProductRepository;
import com.thucphamsach.backend_ecommerce.repository.ReviewRepository;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public PageResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> result = reviewRepository.findByProductIdAndIsVisibleTrue(productId, pageable);
        return PageResponse.<ReviewResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    public ReviewResponse createReview(Long userId, Long productId, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BusinessException("Bạn đã đánh giá sản phẩm này rồi");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVisible(true)
                .build();
        return toResponse(reviewRepository.save(review));
    }

    public ReviewResponse updateReview(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));
        if (!review.getUser().getId().equals(userId)) throw new BusinessException("Không có quyền chỉnh sửa");
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return toResponse(reviewRepository.save(review));
    }

    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));
        if (!review.getUser().getId().equals(userId)) throw new BusinessException("Không có quyền xóa");
        reviewRepository.delete(review);
    }

    public void toggleVisibility(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));
        review.setVisible(!review.isVisible());
        reviewRepository.save(review);
    }

    public ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFullName())
                .userAvatar(r.getUser().getAvatarUrl())
                .rating(r.getRating())
                .comment(r.getComment())
                .visible(r.isVisible())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
