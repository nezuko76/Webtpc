package com.thucphamsach.backend_ecommerce.service;

import com.thucphamsach.backend_ecommerce.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final long MAX_SIZE = 10 * 1024 * 1024;
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"};

    public String uploadImage(MultipartFile file) {
        validateFile(file);
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + "." + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new BusinessException("Lỗi upload file: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/uploads/")) return;
        try {
            Path filePath = Paths.get(uploadDir + imageUrl.replace("/uploads/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // bỏ qua lỗi xóa file
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new BusinessException("File không được trống");
        if (file.getSize() > MAX_SIZE) throw new BusinessException("File không được vượt quá 10MB");
        String contentType = file.getContentType();
        boolean valid = false;
        for (String type : ALLOWED_TYPES) {
            if (type.equals(contentType)) { valid = true; break; }
        }
        if (!valid) throw new BusinessException("Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)");
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
