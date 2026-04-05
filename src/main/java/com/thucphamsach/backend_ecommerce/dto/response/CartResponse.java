package com.thucphamsach.backend_ecommerce.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class CartResponse {
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private int totalItems;
}
