package com.thucphamsach.backend_ecommerce.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class ShippingService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500000");
    private static final BigDecimal BASE_FEE = new BigDecimal("30000");
    private static final BigDecimal REMOTE_FEE = new BigDecimal("50000");

    public BigDecimal calculateShippingFee(String province, BigDecimal subtotal) {
        // Miễn phí ship khi đơn hàng >= 500,000 VND
        if (subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0) {
            return BigDecimal.ZERO;
        }
        // Giả lập phí theo tỉnh
        if (isRemoteProvince(province)) {
            return REMOTE_FEE;
        }
        return BASE_FEE;
    }

    private boolean isRemoteProvince(String province) {
        if (province == null) return false;
        String lower = province.toLowerCase();
        return lower.contains("cà mau") || lower.contains("kiên giang")
            || lower.contains("điện biên") || lower.contains("lai châu")
            || lower.contains("lào cai") || lower.contains("hà giang");
    }
}
