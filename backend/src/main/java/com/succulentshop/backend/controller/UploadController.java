package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.service.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    public UploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Upload product image directly to Cloudinary (tự động xóa ảnh cũ nếu có previousImageUrl)
     */
    @PostMapping(value = "/upload-product-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<Map<String, Object>>> uploadProductImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "previousImageUrl", required = false) String previousImageUrl
    ) {
        Map<String, Object> result = cloudinaryService.uploadAndReplaceImage(file, "senxinh_products", previousImageUrl);
        return ResponseEntity.ok(ApiResult.ok("Tải ảnh sản phẩm lên Cloud thành công", result));
    }

    /**
     * Delete image from Cloudinary by publicId or imageUrl
     */
    @DeleteMapping("/delete-image")
    public ResponseEntity<ApiResult<Map<String, Object>>> deleteImage(
            @RequestParam(value = "publicId", required = false) String publicId,
            @RequestParam(value = "imageUrl", required = false) String imageUrl
    ) {
        String target = (imageUrl != null && !imageUrl.isBlank()) ? imageUrl : publicId;
        if (target == null || target.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResult.error("Vui lòng cung cấp imageUrl hoặc publicId"));
        }
        boolean deleted = cloudinaryService.deleteImage(target);
        return ResponseEntity.ok(ApiResult.ok(
                deleted ? "Xóa ảnh thành công" : "Ảnh đã được xóa hoặc không tồn tại",
                Map.of("deleted", deleted, "target", target)
        ));
    }
}
