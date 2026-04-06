package com.thucphamsach.backend_ecommerce.repository;

import com.thucphamsach.backend_ecommerce.enity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveTrueOrderBySortOrderAsc();
}
