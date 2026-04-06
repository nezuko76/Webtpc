package com.thucphamsach.backend_ecommerce.controller.admin;

import com.thucphamsach.backend_ecommerce.dto.request.UpdateProfileRequest;
import com.thucphamsach.backend_ecommerce.dto.response.*;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import com.thucphamsach.backend_ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "all") String status) {
        // status: "all", "active", "inactive"
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(page, size, status)));
    }

    @PutMapping("/{id}/ban")
    public ResponseEntity<ApiResponse<UserResponse>> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.banUser(id), "Đã khóa tài khoản người dùng"));
    }

    @PutMapping("/{id}/unban")
    public ResponseEntity<ApiResponse<UserResponse>> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.unbanUser(id), "Đã mở khóa tài khoản người dùng"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.toggleUserStatus(id), "Cập nhật trạng thái thành công"));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> changeRole(
            @PathVariable Long id,
            @RequestParam String role) {
        return ResponseEntity.ok(ApiResponse.success(userService.changeRole(id, role)));
    }

    @PutMapping("/{id}/info")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserInfo(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateUserInfo(id, request), "Cập nhật thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        if (body.get("fullName") != null) user.setFullName(body.get("fullName"));
        if (body.get("phone") != null) user.setPhone(body.get("phone"));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(userService.toUserResponse(user), "Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa người dùng"));
    }
}
