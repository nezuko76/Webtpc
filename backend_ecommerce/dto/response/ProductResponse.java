package com.thucphamsach.backend_ecommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer stockQuantity;
    private String certifications;
    private String origin;
    private String unit;
    @JsonProperty("isActive")
    private boolean isActive;
    @JsonProperty("isFeatured")
    private boolean isFeatured;
    private Integer soldCount;
    private Long categoryId;
    private String categoryName;
    private List<String> imageUrls;
    private String primaryImageUrl;
    private Double averageRating;
    private Long reviewCount;
    private LocalDateTime createdAt;
}
