package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.response.DashboardResponse;
import com.thucphamsach.backend_ecommerce.enity.Enums.OrderStatus;
import com.thucphamsach.backend_ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public DashboardResponse getDashboard() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<Object[]> rawChart = orderRepository.getDailyRevenue(thirtyDaysAgo);
        List<Map<String, Object>> chart = rawChart.stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("date", row[0].toString());
            map.put("revenue", row[1]);
            return map;
        }).collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalRevenue(orderRepository.getTotalRevenue())
                .revenueThisMonth(orderRepository.getRevenueFromDate(startOfMonth))
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.count())
                .lowStockProducts(productRepository.countLowStockProducts())
                .revenueChart(chart)
                .topProducts(productRepository.findAll(PageRequest.of(0, 5,
                        org.springframework.data.domain.Sort.by("soldCount").descending()))
                        .getContent().stream().map(productService::toResponse).collect(Collectors.toList()))
                .build();
    }
}
