package com.succulentshop.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${server.port:8080}")
    private String serverPort;

    // Giới hạn kích thước ảnh tối đa (5MB)
    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"
    );

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload an image file to Cloudinary (or local fallback if Cloudinary credentials are not configured).
     *
     * @param file MultipartFile from client
     * @param folder Folder name on Cloudinary
     * @return Map containing url, publicId, and storageType
     */
    public Map<String, Object> uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Vui lòng chọn một file ảnh để tải lên");
        }

        // Validate dung lượng ảnh tối đa
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            double sizeMb = (double) file.getSize() / (1024 * 1024);
            double maxMb = (double) MAX_FILE_SIZE_BYTES / (1024 * 1024);
            throw new AppException(
                    ErrorCode.FILE_TOO_LARGE,
                    String.format("Dung lượng ảnh quá lớn (%.2f MB). Kích thước tối đa cho phép là %.0f MB.", sizeMb, maxMb)
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.FILE_TYPE_NOT_SUPPORTED, "Định dạng file không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WEBP hoặc GIF");
        }

        // 1. If Cloudinary is configured, upload directly to Cloudinary Cloud
        if (cloudName != null && !cloudName.isBlank() && !cloudName.contains("your_cloudinary")) {
            try {
                log.info("Bắt đầu upload ảnh lên Cloudinary folder: {}", folder);

                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", folder != null ? folder : "senxinh_products",
                                "resource_type", "image"
                        )
                );

                String secureUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                log.info("Upload ảnh lên Cloudinary thành công! URL: {}", secureUrl);

                Map<String, Object> response = new HashMap<>();
                response.put("url", secureUrl);
                response.put("publicId", publicId);
                response.put("storage", "CLOUDINARY");
                response.put("bytes", uploadResult.get("bytes"));
                response.put("format", uploadResult.get("format"));

                return response;
            } catch (IOException e) {
                log.error("Lỗi khi tải ảnh lên Cloudinary: {}", e.getMessage(), e);
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không thể tải ảnh lên Cloudinary: " + e.getMessage());
            }
        }

        // 2. Fallback: Save locally if Cloudinary credentials are not yet configured in .env
        log.warn("Chưa phát hiện cấu hình CLOUDINARY_CLOUD_NAME. Sử dụng fallback lưu trữ cục bộ.");
        try {
            String uploadDir = "uploads/products";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = ".jpg";
            }

            String fileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String localUrl = "http://localhost:" + serverPort + "/uploads/products/" + fileName;

            Map<String, Object> response = new HashMap<>();
            response.put("url", localUrl);
            response.put("publicId", fileName);
            response.put("storage", "LOCAL_FALLBACK");
            response.put("bytes", file.getSize());
            response.put("note", "Ảnh lưu tạm tại local. Hãy cấu hình CLOUDINARY_CLOUD_NAME trong backend/.env để chuyển hẳn sang Cloud.");

            return response;
        } catch (IOException e) {
            log.error("Lỗi lưu ảnh fallback cục bộ: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Lỗi khi lưu file ảnh: " + e.getMessage());
        }
    }

    /**
     * Delete an image from Cloudinary by public ID
     */
    public boolean deleteImage(String publicId) {
        if (cloudName == null || cloudName.isBlank() || publicId == null || publicId.isBlank()) {
            return false;
        }
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return "ok".equals(result.get("result"));
        } catch (Exception e) {
            log.warn("Không thể xóa ảnh từ Cloudinary (publicId: {}): {}", publicId, e.getMessage());
            return false;
        }
    }
}
