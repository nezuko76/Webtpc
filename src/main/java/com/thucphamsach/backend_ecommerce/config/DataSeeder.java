package com.thucphamsach.backend_ecommerce.config;

import com.thucphamsach.backend_ecommerce.enity.*;
import com.thucphamsach.backend_ecommerce.enity.Enums.*;
import com.thucphamsach.backend_ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepo,
            CategoryRepository categoryRepo,
            ProductRepository productRepo,
            PasswordEncoder encoder) {
        return args -> {
            // Tạo Admin nếu chưa có
            if (!userRepo.existsByEmail("admin@thucphamsach.vn")) {
                userRepo.save(User.builder()
                        .email("admin@thucphamsach.vn")
                        .passwordHash(encoder.encode("Admin@123"))
                        .fullName("Quản trị viên")
                        .role(Role.ADMIN)
                        .isActive(true)
                        .emailVerified(true)
                        .build());
                log.info("✅ Đã tạo tài khoản admin: admin@thucphamsach.vn / Admin@123");
            }

            // Tạo categories mẫu
            if (categoryRepo.count() == 0) {
                Category rau = categoryRepo.save(Category.builder()
                        .name("Rau củ sạch").slug("rau-cu-sach")
                        .description("Rau củ trồng theo tiêu chuẩn VietGAP")
                        .isActive(true).sortOrder(1).build());

                Category trai = categoryRepo.save(Category.builder()
                        .name("Trái cây hữu cơ").slug("trai-cay-huu-co")
                        .description("Trái cây không thuốc trừ sâu")
                        .isActive(true).sortOrder(2).build());

                Category thit = categoryRepo.save(Category.builder()
                        .name("Thịt sạch").slug("thit-sach")
                        .description("Thịt từ trang trại an toàn")
                        .isActive(true).sortOrder(3).build());

                // Sản phẩm mẫu
                productRepo.save(Product.builder()
                        .name("Rau cải xanh VietGAP 500g").category(rau)
                        .description("Rau cải xanh trồng theo tiêu chuẩn VietGAP, không sử dụng thuốc trừ sâu hóa học.")
                        .price(new BigDecimal("25000")).stockQuantity(100)
                        .certifications("VietGAP").origin("Đà Lạt").unit("bó 500g")
                        .isActive(true).isFeatured(true).soldCount(0).build());

                productRepo.save(Product.builder()
                        .name("Cà rốt hữu cơ 1kg").category(rau)
                        .description("Cà rốt hữu cơ, giàu beta-carotene, nguồn gốc rõ ràng.")
                        .price(new BigDecimal("35000")).stockQuantity(80)
                        .certifications("Organic").origin("Lâm Đồng").unit("túi 1kg")
                        .isActive(true).isFeatured(true).soldCount(0).build());

                productRepo.save(Product.builder()
                        .name("Xoài cát Hòa Lộc").category(trai)
                        .description("Xoài cát Hòa Lộc chín cây, ngọt thơm đặc trưng.")
                        .price(new BigDecimal("85000")).stockQuantity(50)
                        .certifications("VietGAP").origin("Tiền Giang").unit("kg")
                        .isActive(true).isFeatured(false).soldCount(0).build());

                log.info("✅ Đã seed dữ liệu mẫu (categories + products)");
            }
        };
    }
}
