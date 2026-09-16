package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.CartValidateRequest;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CartService {

    private final ProductRepository productRepository;

    public CartService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Map<String, Object> validateCart(CartValidateRequest request) {
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

            if (!p.isActive()) {
                itemResult.put("available", false);
                itemResult.put("status", p.getStatus() != null ? p.getStatus() : "DELETED");
                itemResult.put("message", "Sản phẩm không còn được bán hoặc đã ngừng kinh doanh");
                hasUnavailableItems = true;
            } else if (currentStock <= 0) {
                itemResult.put("available", false);
                itemResult.put("status", "OUT_OF_STOCK");
                itemResult.put("message", "Sản phẩm hiện đang tạm hết hàng trong kho");
                hasOutOfStockItems = true;
            } else if (currentStock < requestedQty) {
                itemResult.put("available", true);
                itemResult.put("status", "LOW_STOCK");
                itemResult.put("message", String.format("Kho chỉ còn %d cây, không đủ số lượng %d bạn yêu cầu", currentStock, requestedQty));
                hasExceededStockItems = true;
            } else {
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
        return response;
    }
}
