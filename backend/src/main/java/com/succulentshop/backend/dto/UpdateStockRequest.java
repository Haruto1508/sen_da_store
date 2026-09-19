package com.succulentshop.backend.dto;

public class UpdateStockRequest {
    private Integer inStock;

    public UpdateStockRequest() {}

    public UpdateStockRequest(Integer inStock) {
        this.inStock = inStock;
    }

    public Integer getInStock() { return inStock; }
    public void setInStock(Integer inStock) { this.inStock = inStock; }
}
