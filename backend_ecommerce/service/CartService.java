package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.request.CartItemRequest;
import com.thucphamsach.backend_ecommerce.dto.response.CartItemResponse;
import com.thucphamsach.backend_ecommerce.dto.response.CartResponse;
import com.thucphamsach.backend_ecommerce.enity.CartItem;
import com.thucphamsach.backend_ecommerce.enity.Product;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.exception.BusinessException;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.CartItemRepository;
import com.thucphamsach.backend_ecommerce.repository.ProductRepository;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartResponse getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        List<CartItemResponse> responses = items.stream().map(this::toResponse).toList();
        BigDecimal subtotal = responses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return CartResponse.builder()
                .items(responses)
                .subtotal(subtotal)
                .totalItems(responses.stream().mapToInt(CartItemResponse::getQuantity).sum())
                .build();
    }

    public CartResponse addItem(Long userId, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));
        if (!product.isActive()) throw new BusinessException("Sản phẩm không còn bán");
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BusinessException("Sản phẩm chỉ còn " + product.getStockQuantity() + " trong kho");
        }
        cartItemRepository.findByUserIdAndProductId(userId, request.getProductId())
                .ifPresentOrElse(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    if (newQty > product.getStockQuantity()) {
                        throw new BusinessException("Số lượng vượt quá tồn kho");
                    }
                    existing.setQuantity(newQty);
                    cartItemRepository.save(existing);
                }, () -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    cartItemRepository.save(CartItem.builder()
                            .user(user).product(product).quantity(request.getQuantity()).build());
                });
        return getCart(userId);
    }

    public CartResponse updateItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy item giỏ hàng"));
        if (!item.getUser().getId().equals(userId)) throw new BusinessException("Không có quyền");
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (item.getProduct().getStockQuantity() < quantity) {
                throw new BusinessException("Số lượng vượt quá tồn kho");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return getCart(userId);
    }

    public CartResponse removeItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy item giỏ hàng"));
        if (!item.getUser().getId().equals(userId)) throw new BusinessException("Không có quyền");
        cartItemRepository.delete(item);
        return getCart(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private CartItemResponse toResponse(CartItem item) {
        Product p = item.getProduct();
        String imageUrl = p.getImages().stream()
                .filter(img -> img.isPrimary())
                .map(img -> img.getImageUrl())
                .findFirst()
                .orElse(p.getImages().isEmpty() ? null : p.getImages().get(0).getImageUrl());
        BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemResponse.builder()
                .cartItemId(item.getId())
                .productId(p.getId())
                .productName(p.getName())
                .imageUrl(imageUrl)
                .price(p.getPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .stockQuantity(p.getStockQuantity())
                .build();
    }
}
