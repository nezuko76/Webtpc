package com.thucphamsach.backend_ecommerce.repository;

import com.thucphamsach.backend_ecommerce.enity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        """)
    Page<Product> findWithFilters(
        @Param("categoryId") Long categoryId,
        @Param("search") String search,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    List<Product> findByCategoryIdAndIsActiveTrueAndIdNot(Long categoryId, Long id, Pageable pageable);
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= 5 AND p.isActive = true")
    long countLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= 5 AND p.isActive = true")
    List<Product> findLowStockProducts();

    long countByCategoryId(Long categoryId);
}
