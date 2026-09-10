package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CartValidateRequest;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final ProductRepository productRepository;

    public CartController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * API kiểm tra tính hợp lệ của giỏ hàng trước khi Checkout
     * Không bao giờ ném lỗi 500/EntityNotFound nếu có sản phẩm bị xóa hoặc hết hàng
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResult<Map<String, Object>>> validateCart(
            @RequestBody(required = false) CartValidateRequest request
    ) {
        List<CartValidateRequest.CartItemDto> items = (request != null && request.getItems() != null)
                ? request.getItems()
                : Collections.emptyList();

        List<Map<String, Object>> validatedItems = new ArrayList<>();
        boolean hasUnavailableItems = false;
        boolean hasOutOfStockItems = false;
        boolean hasExceededStockItems = false;

        for (CartValidateRequest.CartItemDto itemDto : items) {
            String productId = itemDto.getProductId();
            int requestedQty = itemDto.getQuantity();

            Map<String, Object> itemResult = new LinkedHashMap<>();
            itemResult.put("productId", productId);
            itemResult.put("requestedQuantity", requestedQty);

            if (productId == null || productId.isBlank()) {
                itemResult.put("available", false);
                itemResult.put("status", "INVALID");
                itemResult.put("message", "Mã sản phẩm không hợp lệ");
                hasUnavailableItems = true;
                validatedItems.add(itemResult);
                continue;
            }

            Optional<Product> pOpt = productRepository.findById(productId.trim());
            if (pOpt.isEmpty()) {
                itemResult.put("productName", "Sản phẩm không xác định");
                itemResult.put("available", false);
                itemResult.put("status", "NOT_FOUND");
                itemResult.put("inStock", 0);
                itemResult.put("message", "Sản phẩm không tồn tại trong hệ thống");
                hasUnavailableItems = true;
                validatedItems.add(itemResult);
                continue;
            }

            Product p = pOpt.get();
            itemResult.put("productName", p.getName());
            itemResult.put("price", p.getPrice());
            itemResult.put("image", p.getImage());
            int currentStock = p.getInStock() != null ? p.getInStock() : 0;
            itemResult.put("inStock", currentStock);

            // 1. Kiểm tra trạng thái bán (Soft Delete / Deactivate)
            if (!p.isActive()) {
                itemResult.put("available", false);
                itemResult.put("status", p.getStatus() != null ? p.getStatus() : "DELETED");
                itemResult.put("message", "Sản phẩm không còn được bán hoặc đã ngừng kinh doanh");
                hasUnavailableItems = true;
            }
            // 2. Kiểm tra hết hàng hoàn toàn (Stock = 0)
            else if (currentStock <= 0) {
                itemResult.put("available", false);
                itemResult.put("status", "OUT_OF_STOCK");
                itemResult.put("message", "Sản phẩm hiện đang tạm hết hàng trong kho");
                hasOutOfStockItems = true;
            }
            // 3. Kiểm tra số lượng yêu cầu vượt tồn kho (Stock < Quantity)
            else if (currentStock < requestedQty) {
                itemResult.put("available", true);
                itemResult.put("status", "LOW_STOCK");
                itemResult.put("message", String.format("Kho chỉ còn %d cây, không đủ số lượng %d bạn yêu cầu", currentStock, requestedQty));
                hasExceededStockItems = true;
            }
            // 4. Hợp lệ đầy đủ
            else {
                itemResult.put("available", true);
                itemResult.put("status", "ACTIVE");
                itemResult.put("message", "Sẵn sàng đặt hàng");
            }

            validatedItems.add(itemResult);
        }

        boolean canCheckout = !hasUnavailableItems && !hasOutOfStockItems && !hasExceededStockItems && !validatedItems.isEmpty();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("valid", canCheckout);
        response.put("items", validatedItems);
        response.put("hasUnavailableItems", hasUnavailableItems);
        response.put("hasOutOfStockItems", hasOutOfStockItems);
        response.put("hasExceededStockItems", hasExceededStockItems);

        return ResponseEntity.ok(ApiResult.ok("Kiểm tra giỏ hàng thành công", response));
    }
}
