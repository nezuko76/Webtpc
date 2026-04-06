package com.thucphamsach.backend_ecommerce.repository;

import com.thucphamsach.backend_ecommerce.enity.Order;
import com.thucphamsach.backend_ecommerce.enity.Enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt >= :startDate")
    BigDecimal getRevenueFromDate(@Param("startDate") LocalDateTime startDate);

    @Query("""
        SELECT CAST(o.createdAt AS date) as date, SUM(o.totalAmount) as revenue
        FROM Order o
        WHERE o.status = 'DELIVERED' AND o.createdAt >= :startDate
        GROUP BY CAST(o.createdAt AS date)
        ORDER BY CAST(o.createdAt AS date)
        """)
    List<Object[]> getDailyRevenue(@Param("startDate") LocalDateTime startDate);

    long countByStatus(OrderStatus status);

    @Modifying
    @Query("UPDATE Order o SET o.coupon = null WHERE o.coupon.id = :couponId")
    void detachCoupon(@Param("couponId") Long couponId);
}
