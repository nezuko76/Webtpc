package com.thucphamsach.backend_ecommerce.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank private String name;
    @NotNull private Long categoryId;
    @NotNull @DecimalMin("0") private BigDecimal price;
    private BigDecimal originalPrice;
    @NotNull @Min(0) private Integer stockQuantity;
    private String description;
    private String certifications;
    private String origin;
    private String unit;
    @JsonProperty("isFeatured")
    private boolean isFeatured;
    @JsonProperty("isActive")
    private boolean isActive = true;
}
