package com.succulentshop.backend.dto;

import java.util.List;

public class CartValidateRequest {

    private List<CartItemDto> items;

    public List<CartItemDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemDto> items) {
        this.items = items;
    }

    public static class CartItemDto {
        private String productId;
        private Integer quantity;

        public CartItemDto() {
        }

        public CartItemDto(String productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity != null ? quantity : 1;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
