package com.thucphamsach.backend_ecommerce.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class CartItemResponse {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private Integer stockQuantity;
}
