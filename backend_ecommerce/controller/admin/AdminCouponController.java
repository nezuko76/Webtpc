package com.thucphamsach.backend_ecommerce.controller.admin;

import com.thucphamsach.backend_ecommerce.dto.request.CouponRequest;
import com.thucphamsach.backend_ecommerce.dto.response.ApiResponse;
import com.thucphamsach.backend_ecommerce.enity.Coupon;
import com.thucphamsach.backend_ecommerce.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> create(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success(couponService.createCoupon(request), "Tạo coupon thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> update(@PathVariable Long id,
                                                       @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success(couponService.updateCoupon(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String message = couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }

    @DeleteMapping("/{id}/force")
    public ResponseEntity<ApiResponse<Void>> forceDelete(@PathVariable Long id) {
        couponService.forceDeleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa mã giảm giá"));
    }
}
