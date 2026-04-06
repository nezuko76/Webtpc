package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.dto.request.AddressRequest;
import com.thucphamsach.backend_ecommerce.dto.response.AddressResponse;
import com.thucphamsach.backend_ecommerce.enity.Address;
import com.thucphamsach.backend_ecommerce.enity.User;
import com.thucphamsach.backend_ecommerce.exception.BusinessException;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.AddressRepository;
import com.thucphamsach.backend_ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        if (request.isDefault()) {
            clearDefault(userId);
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
        return toResponse(addressRepository.save(address));
    }

    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ"));
        if (request.isDefault()) {
            clearDefault(userId);
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
        return toResponse(addressRepository.save(updated));
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ"));
        if (!address.isDefault()) {
            addressRepository.delete(address);
        } else {
            throw new BusinessException("Không thể xóa địa chỉ mặc định");
        }
    }

    @Transactional
    public AddressResponse setDefault(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy địa chỉ"));
        clearDefault(userId);
        Address updated = Address.builder()
                .id(address.getId())
                .user(address.getUser())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .detail(address.getDetail())
                .isDefault(true)
                .build();
        return toResponse(addressRepository.save(updated));
    }

    private void clearDefault(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
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

    public AddressResponse toResponse(Address a) {
        String full = Stream.of(a.getDetail(), a.getWard(), a.getDistrict(), a.getProvince())
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));
        return AddressResponse.builder()
                .id(a.getId())
                .recipientName(a.getRecipientName())
                .phone(a.getPhone())
                .province(a.getProvince())
                .district(a.getDistrict())
                .ward(a.getWard())
                .detail(a.getDetail())
                .isDefault(a.isDefault())
                .fullAddress(full)
                .build();
    }
}
