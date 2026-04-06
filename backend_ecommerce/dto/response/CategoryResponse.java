package com.thucphamsach.backend_ecommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    @JsonProperty("isActive")
    private boolean isActive;
    private int sortOrder;
    private Long productCount;
}
