package com.thucphamsach.backend_ecommerce.dto.request;

import com.thucphamsach.backend_ecommerce.enity.Enums.DiscountType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank private String code;
    private String description;
    @NotNull private DiscountType discountType;
    @NotNull @DecimalMin("0") private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private LocalDateTime expiresAt;
    @JsonProperty("isActive")
    private boolean isActive = true;
}
