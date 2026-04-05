package com.thucphamsach.backend_ecommerce.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class DashboardResponse {
    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
    private long totalOrders;
    private long pendingOrders;
    private long totalUsers;
    private long totalProducts;
    private long lowStockProducts;
    private List<Map<String, Object>> revenueChart;
    private List<ProductResponse> topProducts;
}
