package com.thucphamsach.backend_ecommerce.repository;

import com.thucphamsach.backend_ecommerce.enity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
}
