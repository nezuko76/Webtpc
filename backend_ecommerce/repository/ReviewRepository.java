package com.thucphamsach.backend_ecommerce.repository;

import com.thucphamsach.backend_ecommerce.enity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndIsVisibleTrue(Long productId, Pageable pageable);
    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT COALESCE(AVG(CAST(r.rating AS double)), 0) FROM Review r WHERE r.product.id = :productId AND r.isVisible = true")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.isVisible = true")
    Long countByProductId(@Param("productId") Long productId);
}
