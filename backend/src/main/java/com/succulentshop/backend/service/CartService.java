package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.CartItemValidationResult;
import com.succulentshop.backend.dto.CartValidateRequest;
import com.succulentshop.backend.dto.CartValidateResponse;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final ProductRepository productRepository;

    public CartService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public CartValidateResponse validateCart(CartValidateRequest request) {
        List<CartValidateRequest.CartItemDto> items = (request != null && request.getItems() != null)
                ? request.getItems()
                : Collections.emptyList();

        List<CartItemValidationResult> validatedItems = new ArrayList<>();
        boolean hasUnavailableItems = false;
        boolean hasOutOfStockItems = false;
        boolean hasExceededStockItems = false;

        for (CartValidateRequest.CartItemDto itemDto : items) {
            String productId = itemDto.getProductId();
            int requestedQty = itemDto.getQuantity();

            CartItemValidationResult itemResult = new CartItemValidationResult();
            itemResult.setProductId(productId);
            itemResult.setRequestedQuantity(requestedQty);

            if (productId == null || productId.isBlank()) {
                itemResult.setAvailable(false);
                itemResult.setStatus("INVALID");
                itemResult.setMessage("Mã sản phẩm không hợp lệ");
                hasUnavailableItems = true;
                validatedItems.add(itemResult);
                continue;
            }

            Optional<Product> pOpt = productRepository.findById(productId.trim());
            if (pOpt.isEmpty()) {
                itemResult.setProductName("Sản phẩm không xác định");
                itemResult.setAvailable(false);
                itemResult.setStatus("NOT_FOUND");
                itemResult.setInStock(0);
                itemResult.setMessage("Sản phẩm không tồn tại trong hệ thống");
                hasUnavailableItems = true;
                validatedItems.add(itemResult);
                continue;
            }

            Product p = pOpt.get();
            itemResult.setProductName(p.getName());
            itemResult.setPrice(p.getPrice());
            itemResult.setImage(p.getImage());
            int currentStock = p.getInStock() != null ? p.getInStock() : 0;
            itemResult.setInStock(currentStock);

            if (!p.isActive()) {
                itemResult.setAvailable(false);
                itemResult.setStatus(p.getStatus() != null ? p.getStatus() : "DELETED");
                itemResult.setMessage("Sản phẩm không còn được bán hoặc đã ngừng kinh doanh");
                hasUnavailableItems = true;
            } else if (currentStock <= 0) {
                itemResult.setAvailable(false);
                itemResult.setStatus("OUT_OF_STOCK");
                itemResult.setMessage("Sản phẩm hiện đang tạm hết hàng trong kho");
                hasOutOfStockItems = true;
            } else if (currentStock < requestedQty) {
                itemResult.setAvailable(true);
                itemResult.setStatus("LOW_STOCK");
                itemResult.setMessage(String.format("Kho chỉ còn %d cây, không đủ số lượng %d bạn yêu cầu", currentStock, requestedQty));
                hasExceededStockItems = true;
            } else {
                itemResult.setAvailable(true);
                itemResult.setStatus("ACTIVE");
                itemResult.setMessage("Sẵn sàng đặt hàng");
            }

            validatedItems.add(itemResult);
        }

        boolean canCheckout = !hasUnavailableItems && !hasOutOfStockItems && !hasExceededStockItems && !validatedItems.isEmpty();

        CartValidateResponse response = new CartValidateResponse();
        response.setValid(canCheckout);
        response.setItems(validatedItems);
        response.setHasUnavailableItems(hasUnavailableItems);
        response.setHasOutOfStockItems(hasOutOfStockItems);
        response.setHasExceededStockItems(hasExceededStockItems);
        response.setCanProceed(canCheckout);
        return response;
    }
}
