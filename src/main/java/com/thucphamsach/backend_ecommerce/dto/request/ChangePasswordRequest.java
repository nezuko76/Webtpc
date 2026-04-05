package com.thucphamsach.backend_ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank
    private String oldPassword;
    @NotBlank @Size(min = 6)
    private String newPassword;
}
