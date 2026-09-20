package com.succulentshop.backend.controller;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.ProductResponse;
import com.succulentshop.backend.dto.ReviewRequest;
import com.succulentshop.backend.dto.ReviewResponse;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResult<List<ProductResponse>>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String light,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false, defaultValue = "featured") String sort
    ) {
        List<ProductResponse> responseList = productService.getFilteredProducts(category, search, light, difficulty, sort);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PRODUCT_LIST_SUCCESS, responseList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResult<ProductResponse>> getProductById(@PathVariable String id) {
        ProductResponse productData = productService.getProductDetail(id);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PRODUCT_DETAIL_SUCCESS, productData));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResult<ReviewResponse>> submitReview(
            @PathVariable String id,
            @RequestBody ReviewRequest reviewRequest
    ) {
        if (reviewRequest.getRating() == null || reviewRequest.getRating() < 1 || reviewRequest.getRating() > 5) {
            return ResponseEntity.badRequest().body(ApiResult.error(ErrorCode.INVALID_RATING));
        }

        ReviewResponse result = productService.addReview(
                id,
                reviewRequest.getRating(),
                reviewRequest.getComment(),
                reviewRequest.getReviewerName()
        );

        return ResponseEntity.ok(ApiResult.ok(MessageCode.REVIEW_SUBMITTED, result));
    }
}
