package com.thucphamsach.backend_ecommerce.dto.response;

import com.thucphamsach.backend_ecommerce.enity.Enums.OrderStatus;
import com.thucphamsach.backend_ecommerce.enity.Enums.PaymentMethod;
import com.thucphamsach.backend_ecommerce.enity.Enums.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class OrderResponse {
    private Long id;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String trackingCode;
    private String notes;
    private LocalDateTime createdAt;
    private AddressResponse shippingAddress;
    private List<OrderItemResponse> items;
    private String couponCode;
}
