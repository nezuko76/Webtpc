package com.thucphamsach.backend_ecommerce.dto.response;

import com.thucphamsach.backend_ecommerce.enity.Enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Role role;
    @JsonProperty("isActive")
    private boolean isActive;
    @JsonProperty("emailVerified")
    private boolean emailVerified;
    private LocalDateTime createdAt;
}
