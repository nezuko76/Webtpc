package com.thucphamsach.backend_ecommerce.controller;

import com.thucphamsach.backend_ecommerce.dto.response.ApiResponse;
import com.thucphamsach.backend_ecommerce.enity.Banner;
import com.thucphamsach.backend_ecommerce.exception.ResourceNotFoundException;
import com.thucphamsach.backend_ecommerce.repository.BannerRepository;
import com.thucphamsach.backend_ecommerce.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerRepository bannerRepository;
    private final FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Banner>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(bannerRepository.findByIsActiveTrueOrderBySortOrderAsc()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Banner>> create(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String linkUrl,
            @RequestParam(defaultValue = "0") int sortOrder,
            @RequestParam("image") MultipartFile image) {
        String imageUrl = fileUploadService.uploadImage(image);
        Banner banner = Banner.builder()
                .title(title).imageUrl(imageUrl).linkUrl(linkUrl)
                .sortOrder(sortOrder).isActive(true).build();
        return ResponseEntity.ok(ApiResponse.success(bannerRepository.save(banner), "Tạo banner thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Banner>> update(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String linkUrl,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Integer sortOrder,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner"));
        if (title != null) banner.setTitle(title);
        if (linkUrl != null) banner.setLinkUrl(linkUrl);
        if (isActive != null) banner.setActive(isActive);
        if (sortOrder != null) banner.setSortOrder(sortOrder);
        if (image != null && !image.isEmpty()) {
            fileUploadService.deleteImage(banner.getImageUrl());
            banner.setImageUrl(fileUploadService.uploadImage(image));
        }
        return ResponseEntity.ok(ApiResponse.success(bannerRepository.save(banner)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner"));
        fileUploadService.deleteImage(banner.getImageUrl());
        bannerRepository.delete(banner);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa banner thành công"));
    }
}
