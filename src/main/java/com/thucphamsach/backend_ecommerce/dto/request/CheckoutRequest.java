package com.thucphamsach.backend_ecommerce.dto.request;

import com.thucphamsach.backend_ecommerce.enity.Enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotNull private Long addressId;
    @NotNull private PaymentMethod paymentMethod;
    private String couponCode;
    private String notes;
}
