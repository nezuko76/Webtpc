package com.thucphamsach.backend_ecommerce.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank private String name;
    private String description;
    @JsonProperty("isActive")
    private boolean isActive = true;
    private int sortOrder = 0;
}
