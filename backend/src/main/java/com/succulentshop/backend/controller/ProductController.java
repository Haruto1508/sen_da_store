package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.ReviewRequest;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResult<List<Map<String, Object>>>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String light,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false, defaultValue = "featured") String sort
    ) {
        List<Map<String, Object>> responseList = productService.getFilteredProducts(category, search, light, difficulty, sort);
        return ResponseEntity.ok(ApiResult.ok("Lấy danh sách sản phẩm thành công", responseList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResult<Map<String, Object>>> getProductById(@PathVariable String id) {
        Map<String, Object> productData = productService.getProductDetail(id);
        return ResponseEntity.ok(ApiResult.ok("Lấy chi tiết sản phẩm thành công", productData));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResult<Map<String, Object>>> submitReview(
            @PathVariable String id,
            @RequestBody ReviewRequest reviewRequest
    ) {
        if (reviewRequest.getRating() == null || reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
            return ResponseEntity.badRequest().body(ApiResult.error(ErrorCode.INVALID_RATING));
        }

        Map<String, Object> result = productService.addReview(
                id,
                reviewRequest.getRating(),
                reviewRequest.getComment(),
                reviewRequest.getReviewerName()
        );

        return ResponseEntity.ok(ApiResult.ok("Gửi đánh giá thành công! Cảm ơn phản hồi của bạn.", result));
    }
}
