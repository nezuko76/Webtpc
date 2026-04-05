package com.thucphamsach.backend_ecommerce.enity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String title;
    private String imageUrl;
    private String linkUrl;

    @JsonProperty("isActive")
    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private int sortOrder = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
