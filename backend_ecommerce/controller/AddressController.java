package com.thucphamsach.backend_ecommerce.controller;

import com.thucphamsach.backend_ecommerce.dto.request.AddressRequest;
import com.thucphamsach.backend_ecommerce.dto.response.AddressResponse;
import com.thucphamsach.backend_ecommerce.dto.response.ApiResponse;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import com.thucphamsach.backend_ecommerce.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAll(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(addressService.getAddresses(getUserId(userDetails))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                addressService.createAddress(getUserId(userDetails), request), "Thêm địa chỉ thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                addressService.updateAddress(getUserId(userDetails), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        addressService.deleteAddress(getUserId(userDetails), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa địa chỉ thành công"));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(addressService.setDefault(getUserId(userDetails), id)));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return user.getId();
    }
}
