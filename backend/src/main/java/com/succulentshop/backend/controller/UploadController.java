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
     * Upload product image directly to Cloudinary
     */
    @PostMapping(value = "/upload-product-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<Map<String, Object>>> uploadProductImage(
            @RequestParam("file") MultipartFile file
    ) {
        Map<String, Object> result = cloudinaryService.uploadImage(file, "senxinh_products");
        return ResponseEntity.ok(ApiResult.ok("Tải ảnh sản phẩm lên Cloud thành công", result));
    }

    /**
     * Delete image from Cloudinary (optional cleanup)
     */
    @DeleteMapping("/delete-image")
    public ResponseEntity<ApiResult<Map<String, Object>>> deleteImage(
            @RequestParam("publicId") String publicId
    ) {
        boolean deleted = cloudinaryService.deleteImage(publicId);
        return ResponseEntity.ok(ApiResult.ok(
                deleted ? "Xóa ảnh thành công" : "Không thể xóa hoặc ảnh không tồn tại",
                Map.of("deleted", deleted, "publicId", publicId)
        ));
    }
}
