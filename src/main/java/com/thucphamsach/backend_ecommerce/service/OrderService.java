package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.request.CheckoutRequest;
import com.thucphamsach.backend_ecommerce.dto.response.*;
import com.thucphamsach.backend_ecommerce.enity.*;
import com.thucphamsach.backend_ecommerce.enity.Enums.*;
import com.thucphamsach.backend_ecommerce.exception.BusinessException;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final EmailService emailService;

    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) throw new BusinessException("Giỏ hàng trống");

        // Validate tồn kho và tính subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        List<Product> validatedProducts = new java.util.ArrayList<>();
        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));
            if (product.getStockQuantity() < item.getQuantity())
                throw new BusinessException("Sản phẩm '" + product.getName() + "' không đủ số lượng");
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            validatedProducts.add(product);
        }

        // Coupon
        Coupon coupon = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            java.util.Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(request.getCouponCode());
            if (couponOpt.isPresent()) {
                coupon = couponOpt.get();
                discountAmount = couponService.calculateDiscount(coupon, subtotal);
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);
            }
        }

        // Phí ship
        BigDecimal shippingFee = subtotal.compareTo(BigDecimal.valueOf(500000)) >= 0
                ? BigDecimal.ZERO : BigDecimal.valueOf(30000);
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        // Tạo Order
        Order order = Order.builder()
                .user(user)
                .shippingAddress(address)
                .coupon(coupon)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.UNPAID)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .notes(request.getNotes())
                .items(new java.util.ArrayList<>())
                .build();

        // Tạo OrderItems
        for (int i = 0; i < cartItems.size(); i++) {
            CartItem item = cartItems.get(i);
            Product product = validatedProducts.get(i);

            String imageSnapshot = null;
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                imageSnapshot = product.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .map(ProductImage::getImageUrl)
                        .findFirst()
                        .orElse(product.getImages().get(0).getImageUrl());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .productNameSnapshot(product.getName())
                    .productImageSnapshot(imageSnapshot)
                    .build();
            order.getItems().add(orderItem);

            // Trừ kho
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            product.setSoldCount(product.getSoldCount() + item.getQuantity());
            productRepository.save(product);
        }

        Order saved = orderRepository.save(order);
        cartItemRepository.deleteByUserId(userId);

        // Gửi email async — bọc try-catch để không ảnh hưởng transaction
        try {
            emailService.sendOrderConfirmationEmail(user.getEmail(), user.getFullName(), saved);
        } catch (Exception e) {
            // Log nhưng không throw
        }

        return toResponse(saved);
    }

    public PageResponse<OrderResponse> getMyOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> result = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return toPageResponse(result);
    }

    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) throw new BusinessException("Không có quyền xem đơn hàng này");
        return toResponse(order);
    }

    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) throw new BusinessException("Không có quyền");
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý");
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.getItems().forEach(item -> {
            Product p = item.getProduct();
            p.setStockQuantity(p.getStockQuantity() + item.getQuantity());
            p.setSoldCount(Math.max(0, p.getSoldCount() - item.getQuantity()));
            productRepository.save(p);
        });
        return toResponse(orderRepository.save(order));
    }

    public PageResponse<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return toPageResponse(orderRepository.findAllByOrderByCreatedAtDesc(pageable));
    }

    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));
        order.setStatus(status);
        if (status == OrderStatus.DELIVERED) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        return toResponse(orderRepository.save(order));
    }

    private PageResponse<OrderResponse> toPageResponse(Page<Order> page) {
        return PageResponse.<OrderResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private OrderResponse toResponse(Order o) {
        AddressResponse addressResponse = null;
        if (o.getShippingAddress() != null) {
            Address a = o.getShippingAddress();
            addressResponse = AddressResponse.builder()
                    .id(a.getId()).recipientName(a.getRecipientName()).phone(a.getPhone())
                    .province(a.getProvince()).district(a.getDistrict()).ward(a.getWard())
                    .detail(a.getDetail()).isDefault(a.isDefault())
                    .fullAddress(String.join(", ", a.getDetail(), a.getWard(), a.getDistrict(), a.getProvince()))
                    .build();
        }
        List<OrderItemResponse> items = o.getItems().stream().map(item ->
                OrderItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProductNameSnapshot())
                        .productImage(item.getProductImageSnapshot())
                        .price(item.getPriceAtPurchase())
                        .quantity(item.getQuantity())
                        .subtotal(item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build()
        ).toList();
        return OrderResponse.builder()
                .id(o.getId()).status(o.getStatus())
                .paymentMethod(o.getPaymentMethod()).paymentStatus(o.getPaymentStatus())
                .subtotal(o.getSubtotal()).discountAmount(o.getDiscountAmount())
                .shippingFee(o.getShippingFee()).totalAmount(o.getTotalAmount())
                .trackingCode(o.getTrackingCode()).notes(o.getNotes())
                .createdAt(o.getCreatedAt()).shippingAddress(addressResponse).items(items)
                .couponCode(o.getCoupon() != null ? o.getCoupon().getCode() : null)
                .build();
    }
}
