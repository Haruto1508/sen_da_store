package com.succulentshop.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.succulentshop.backend.dto.CloudinaryUploadResponse;
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
    public static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

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
     * @return DTO containing url, publicId, and storageType
     */
    public CloudinaryUploadResponse uploadImage(MultipartFile file, String folder) {
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

                CloudinaryUploadResponse response = new CloudinaryUploadResponse();
                response.setUrl(secureUrl);
                response.setPublicId(publicId);
                response.setStorage("CLOUDINARY");
                response.setBytes(uploadResult.get("bytes") instanceof Number ? ((Number) uploadResult.get("bytes")).longValue() : null);
                response.setFormat(String.valueOf(uploadResult.get("format")));
                return response;
            } catch (Exception e) {
                log.error("Lỗi khi tải ảnh lên Cloudinary: {}", e.getMessage(), e);
                String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";

                if (msg.contains("quota") || msg.contains("credit") || msg.contains("limit")
                        || msg.contains("storage") || msg.contains("capacity") || msg.contains("exceeded")
                        || msg.contains("disabled") || msg.contains("out of")) {
                    throw new AppException(
                            ErrorCode.STORAGE_LIMIT_EXCEEDED,
                            "Bộ nhớ lưu trữ đám mây (Cloudinary) đã đầy hoặc đạt giới hạn lưu trữ gói tài khoản! Không thể tải thêm ảnh mới. Vui lòng xóa bớt ảnh cũ để giải phóng dung lượng."
                    );
                }

                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Không thể tải ảnh lên Cloudinary: " + e.getMessage());
            }
        }

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

            CloudinaryUploadResponse response = new CloudinaryUploadResponse();
            response.setUrl(localUrl);
            response.setPublicId(fileName);
            response.setStorage("LOCAL_FALLBACK");
            response.setBytes(file.getSize());
            response.setNote("Ảnh lưu tạm tại local. Hãy cấu hình CLOUDINARY_CLOUD_NAME trong backend/.env để chuyển hẳn sang Cloud.");
            return response;
        } catch (IOException e) {
            log.error("Lỗi lưu ảnh fallback cục bộ: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Lỗi khi lưu file ảnh: " + e.getMessage());
        }
    }

    /**
     * Upload an image file to Cloudinary and automatically delete the previous image if provided.
     *
     * @param file MultipartFile from client
     * @param folder Folder name on Cloudinary
     * @param previousImageUrl Old image URL to be deleted from cloud
     * @return DTO containing url, publicId, and storageType
     */
    public CloudinaryUploadResponse uploadAndReplaceImage(MultipartFile file, String folder, String previousImageUrl) {
       CloudinaryUploadResponse uploadResult = uploadImage(file, folder);

       if (previousImageUrl != null && !previousImageUrl.isBlank()) {
           try {
               deleteImage(previousImageUrl);
               log.info("Đã tự động xóa ảnh cũ trên cloud: {}", previousImageUrl);
           } catch (Exception ex) {
               log.warn("Không thể xóa ảnh cũ {}: {}", previousImageUrl, ex.getMessage());
           }
       }

       return uploadResult;
    }

    /**
     * Trích xuất publicId từ Cloudinary secure_url hoặc url bất kỳ
     * Ví dụ: https://res.cloudinary.com/demo/image/upload/v12345/senxinh_products/abc.jpg -> senxinh_products/abc
     */
    public String extractPublicIdFromUrl(String url) {
        if (url == null || url.isBlank() || !url.contains("cloudinary.com")) {
            return null;
        }
        try {
            int uploadIdx = url.indexOf("/upload/");
            if (uploadIdx == -1) return null;

            String path = url.substring(uploadIdx + "/upload/".length());
            String[] segments = path.split("/");
            StringBuilder publicIdBuilder = new StringBuilder();
            boolean pastVersionOrTransforms = false;

            for (String seg : segments) {
                // Bỏ qua version (v12345678) hoặc transformation (w_500, c_fill,...)
                if (!pastVersionOrTransforms && (seg.matches("^v\\d+$") || seg.contains(",") || seg.startsWith("w_") || seg.startsWith("h_") || seg.startsWith("c_"))) {
                    continue;
                }
                pastVersionOrTransforms = true;
                if (publicIdBuilder.length() > 0) {
                    publicIdBuilder.append("/");
                }
                publicIdBuilder.append(seg);
            }

            String fullPublicIdWithExt = publicIdBuilder.toString();
            int lastDotIdx = fullPublicIdWithExt.lastIndexOf('.');
            if (lastDotIdx != -1) {
                return fullPublicIdWithExt.substring(0, lastDotIdx);
            }
            return fullPublicIdWithExt;
        } catch (Exception e) {
            log.warn("Không thể trích xuất publicId từ URL {}: {}", url, e.getMessage());
            return null;
        }
    }

    /**
     * Delete an image from Cloudinary by public ID or full URL
     */
    public boolean deleteImage(String publicIdOrUrl) {
        if (publicIdOrUrl == null || publicIdOrUrl.isBlank()) {
            return false;
        }

        String target = publicIdOrUrl.trim();

        // 1. Nếu là Cloudinary URL hoặc publicId
        if (target.contains("cloudinary.com")) {
            String extracted = extractPublicIdFromUrl(target);
            if (extracted != null && !extracted.isBlank()) {
                target = extracted;
            }
        }

        // 2. Nếu là local fallback URL (ví dụ: http://localhost:8080/uploads/products/abc.jpg)
        if (target.contains("/uploads/products/")) {
            try {
                String fileName = target.substring(target.lastIndexOf("/") + 1);
                Path localFile = Paths.get("uploads/products").resolve(fileName);
                boolean deleted = Files.deleteIfExists(localFile);
                log.info("Xóa file ảnh cục bộ: {} -> {}", localFile, deleted);
                return deleted;
            } catch (Exception e) {
                log.warn("Lỗi khi xóa file ảnh cục bộ {}: {}", target, e.getMessage());
                return false;
            }
        }

        if (cloudName == null || cloudName.isBlank() || cloudName.contains("your_cloudinary")) {
            return false;
        }

        try {
            log.info("Gửi yêu cầu xóa ảnh Cloudinary với publicId: {}", target);
            Map<?, ?> result = cloudinary.uploader().destroy(target, ObjectUtils.emptyMap());
            String status = result != null ? (String) result.get("result") : "";
            log.info("Kết quả xóa ảnh Cloudinary (publicId: {}): {}", target, status);
            return "ok".equals(status);
        } catch (Exception e) {
            log.warn("Không thể xóa ảnh từ Cloudinary (publicId: {}): {}", target, e.getMessage());
            return false;
        }
    }
}
