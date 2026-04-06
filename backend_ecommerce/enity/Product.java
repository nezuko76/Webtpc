package com.thucphamsach.backend_ecommerce.enity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Category category;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal price;

    private BigDecimal originalPrice;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String certifications;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String origin;
    @Column(columnDefinition = "NVARCHAR(100)")
    private String unit;

    @JsonProperty("isActive")
    @Builder.Default
    private boolean isActive = true;

    @JsonProperty("isFeatured")
    @Builder.Default
    private boolean isFeatured = false;

    @Builder.Default
    private Integer soldCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
}
