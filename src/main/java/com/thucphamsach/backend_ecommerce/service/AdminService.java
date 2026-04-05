package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.response.DashboardResponse;
import com.thucphamsach.backend_ecommerce.dto.response.ProductResponse;
import com.thucphamsach.backend_ecommerce.enity.Enums.OrderStatus;
import com.thucphamsach.backend_ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public DashboardResponse getDashboard() {
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        BigDecimal revenueThisMonth = orderRepository.getRevenueFromDate(
                LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0));

        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long lowStockProducts = productRepository.countLowStockProducts();

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> dailyData = orderRepository.getDailyRevenue(thirtyDaysAgo);
        List<Map<String, Object>> revenueChart = new ArrayList<>();
        for (Object[] row : dailyData) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", row[0].toString());
            entry.put("revenue", row[1]);
            revenueChart.add(entry);
        }

        List<ProductResponse> topProducts = productRepository
                .findAll(PageRequest.of(0, 5, org.springframework.data.domain.Sort.by("soldCount").descending()))
                .getContent().stream().map(productService::toResponse).toList();

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .revenueThisMonth(revenueThisMonth)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .revenueChart(revenueChart)
                .topProducts(topProducts)
                .build();
    }
}
