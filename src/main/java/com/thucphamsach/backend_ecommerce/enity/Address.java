package com.thucphamsach.backend_ecommerce.enity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    // ← DB dùng "phone_number"
    @Column(name = "phone_number", nullable = false)
    private String phone;

    private String province;
    private String district;
    private String ward;

    // ← DB dùng "detail_address"
    @Column(name = "detail_address", nullable = false)
    private String detail;

    @Column(name = "is_default")
    private boolean isDefault = false;
}
