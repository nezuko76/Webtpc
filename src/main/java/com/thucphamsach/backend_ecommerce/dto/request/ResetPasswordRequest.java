package com.thucphamsach.backend_ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String otp;
    @NotBlank @Size(min = 6)
    private String newPassword;
}
