package com.succulentshop.backend.dto;

public class UpdateStockResponse {
    private Integer inStock;

    public UpdateStockResponse() {}

    public UpdateStockResponse(Integer inStock) {
        this.inStock = inStock;
    }

    public Integer getInStock() { return inStock; }
    public void setInStock(Integer inStock) { this.inStock = inStock; }
}
