package com.thucphamsach.backend_ecommerce.controller;

import com.thucphamsach.backend_ecommerce.dto.response.ApiResponse;
import com.thucphamsach.backend_ecommerce.enity.Coupon;
import com.thucphamsach.backend_ecommerce.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validate(
            @RequestParam String code,
            @RequestParam BigDecimal subtotal) {
        Coupon coupon = couponService.validateCoupon(code, subtotal);
        BigDecimal discount = couponService.calculateDiscount(coupon, subtotal);

        Map<String, Object> result = new HashMap<>();
        result.put("code", coupon.getCode());
        result.put("description", coupon.getDescription());
        result.put("discountAmount", discount);
        result.put("discountType", coupon.getDiscountType());
        result.put("discountValue", coupon.getDiscountValue());

        return ResponseEntity.ok(ApiResponse.success(result, "Mã giảm giá hợp lệ"));
    }
}
