package com.thucphamsach.backend_ecommerce.enity;

import com.thucphamsach.backend_ecommerce.enity.Enums.DiscountType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;

    @Builder.Default
    private Integer usedCount = 0;

    private LocalDateTime expiresAt;

    @JsonProperty("isActive")
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
