package com.thucphamsach.backend_ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank private String recipientName;
    @NotBlank private String phone;
    @NotBlank private String province;
    @NotBlank private String district;
    @NotBlank private String ward;
    @NotBlank private String detail;
    private boolean isDefault;
}
