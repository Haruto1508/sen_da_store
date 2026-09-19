package com.succulentshop.backend.dto;

public class CartItemValidationResult {
    private String productId;
    private String productName;
    private int requestedQuantity;
    private boolean available;
    private String status;
    private int inStock;
    private Integer price;
    private String image;
    private String message;

    public CartItemValidationResult() {}

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(int requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getInStock() { return inStock; }
    public void setInStock(int inStock) { this.inStock = inStock; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
