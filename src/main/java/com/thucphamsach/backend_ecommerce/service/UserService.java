package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.request.*;
import com.thucphamsach.backend_ecommerce.dto.response.*;
import com.thucphamsach.backend_ecommerce.enity.Address;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.exception.*;
import com.thucphamsach.backend_ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final FileUploadService fileUploadService;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile(String email) {
        User user = findUserByEmail(email);
        return toUserResponse(user);
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse updateAvatar(String email, MultipartFile file) {
        User user = findUserByEmail(email);
        if (user.getAvatarUrl() != null) fileUploadService.deleteImage(user.getAvatarUrl());
        String url = fileUploadService.uploadImage(file);
        user.setAvatarUrl(url);
        return toUserResponse(userRepository.save(user));
    }

    public List<AddressResponse> getAddresses(String email) {
        User user = findUserByEmail(email);
        return addressRepository.findByUserIdOrderByIsDefaultDesc(user.getId())
                .stream().map(this::toAddressResponse).collect(Collectors.toList());
    }

    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = findUserByEmail(email);
        if (request.isDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                    .ifPresent(a -> {
                        Address updated = Address.builder()
                                .id(a.getId())
                                .user(a.getUser())
                                .recipientName(a.getRecipientName())
                                .phone(a.getPhone())
                                .province(a.getProvince())
                                .district(a.getDistrict())
                                .ward(a.getWard())
                                .detail(a.getDetail())
                                .isDefault(false)
                                .build();
                        addressRepository.save(updated);
                    });
        }
        Address address = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .detail(request.getDetail())
                .isDefault(request.isDefault())
                .build();
        return toAddressResponse(addressRepository.save(address));
    }

    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        User user = findUserByEmail(email);
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));
        if (request.isDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                    .ifPresent(a -> {
                        Address updated = Address.builder()
                                .id(a.getId())
                                .user(a.getUser())
                                .recipientName(a.getRecipientName())
                                .phone(a.getPhone())
                                .province(a.getProvince())
                                .district(a.getDistrict())
                                .ward(a.getWard())
                                .detail(a.getDetail())
                                .isDefault(false)
                                .build();
                        addressRepository.save(updated);
                    });
        }
        Address updated = Address.builder()
                .id(address.getId())
                .user(address.getUser())
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .province(request.getProvince())
                .district(request.getDistrict())
                .ward(request.getWard())
                .detail(request.getDetail())
                .isDefault(request.isDefault())
                .build();
        return toAddressResponse(addressRepository.save(updated));
    }

    public void deleteAddress(String email, Long addressId) {
        User user = findUserByEmail(email);
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại"));
        addressRepository.delete(address);
    }

    // Admin methods
    public PageResponse<UserResponse> getAllUsers(int page, int size, String status) {
        Page<User> userPage;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        switch(status.toLowerCase()) {
            case "active":
                userPage = userRepository.findByIsActiveTrue(pageable);
                break;
            case "inactive":
                userPage = userRepository.findByIsActiveFalse(pageable);
                break;
            default: // "all"
                userPage = userRepository.findAll(pageable);
        }
        
        return PageResponse.<UserResponse>builder()
                .content(userPage.getContent().stream().map(this::toUserResponse).collect(Collectors.toList()))
                .page(page).size(size)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    public PageResponse<UserResponse> getAllUsers(int page, int size) {
        return getAllUsers(page, size, "all");
    }

    public UserResponse updateUserInfo(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        if (!user.isActive()) {
            throw new BusinessException("Tài khoản này đã bị khóa rồi");
        }
        user.setActive(false);
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        if (user.isActive()) {
            throw new BusinessException("Tài khoản này đã hoạt động rồi");
        }
        user.setActive(true);
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        user.setActive(!user.isActive());
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse changeRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        user.setRole(com.thucphamsach.backend_ecommerce.enity.Enums.Role.valueOf(role.toUpperCase()));
        return toUserResponse(userRepository.save(user));
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        userRepository.delete(user);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId()).email(user.getEmail())
                .fullName(user.getFullName()).phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl()).role(user.getRole())
                .isActive(user.isActive()).emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt()).build();
    }

    public AddressResponse toAddressResponse(Address a) {
        String full = a.getDetail() + ", " + a.getWard() + ", "
                + a.getDistrict() + ", " + a.getProvince();
        return AddressResponse.builder()
                .id(a.getId())
                .recipientName(a.getRecipientName())
                .phone(a.getPhone())           // ← getPhone() map về phone_number
                .province(a.getProvince())
                .district(a.getDistrict())
                .ward(a.getWard())
                .detail(a.getDetail())         // ← getDetail() map về detail_address
                .isDefault(a.isDefault())
                .fullAddress(full)
                .build();
    }
}
