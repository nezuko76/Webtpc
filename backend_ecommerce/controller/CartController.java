package com.thucphamsach.backend_ecommerce.controller;

import com.thucphamsach.backend_ecommerce.dto.request.CartItemRequest;
import com.thucphamsach.backend_ecommerce.dto.response.ApiResponse;
import com.thucphamsach.backend_ecommerce.dto.response.CartResponse;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import com.thucphamsach.backend_ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(cartService.addItem(userId, request), "Đã thêm vào giỏ hàng"));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(cartService.updateItem(userId, cartItemId, quantity)));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(cartService.removeItem(userId, cartItemId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa giỏ hàng"));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return user.getId();
    }
}
