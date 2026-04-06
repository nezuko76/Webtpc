package com.thucphamsach.backend_ecommerce.controller.admin;

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
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBannerController {

    private final BannerRepository bannerRepository;
    private final FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Banner>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(bannerRepository.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Banner>> create(
            @RequestParam String title,
            @RequestParam(required = false) String linkUrl,
            @RequestParam(defaultValue = "0") int sortOrder,
            @RequestParam("image") MultipartFile image) {
        String imageUrl = fileUploadService.uploadImage(image);
        Banner banner = Banner.builder()
                .title(title).linkUrl(linkUrl).imageUrl(imageUrl)
                .sortOrder(sortOrder).isActive(true).build();
        return ResponseEntity.ok(ApiResponse.success(bannerRepository.save(banner), "Tạo banner thành công"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Banner>> toggleStatus(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner không tồn tại"));
        banner.setActive(!banner.isActive());
        return ResponseEntity.ok(ApiResponse.success(bannerRepository.save(banner)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner không tồn tại"));
        fileUploadService.deleteImage(banner.getImageUrl());
        bannerRepository.delete(banner);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa banner thành công"));
    }
}
