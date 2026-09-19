package com.succulentshop.backend.dto;

import java.util.List;

public class CartValidateResponse {
    private boolean valid;
    private boolean hasUnavailableItems;
    private boolean hasOutOfStockItems;
    private boolean hasExceededStockItems;
    private boolean canProceed;
    private List<CartItemValidationResult> items;

    public CartValidateResponse() {}

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public boolean isHasUnavailableItems() { return hasUnavailableItems; }
    public void setHasUnavailableItems(boolean hasUnavailableItems) { this.hasUnavailableItems = hasUnavailableItems; }

    public boolean isHasOutOfStockItems() { return hasOutOfStockItems; }
    public void setHasOutOfStockItems(boolean hasOutOfStockItems) { this.hasOutOfStockItems = hasOutOfStockItems; }

    public boolean isHasExceededStockItems() { return hasExceededStockItems; }
    public void setHasExceededStockItems(boolean hasExceededStockItems) { this.hasExceededStockItems = hasExceededStockItems; }

    public boolean isCanProceed() { return canProceed; }
    public void setCanProceed(boolean canProceed) { this.canProceed = canProceed; }

    public List<CartItemValidationResult> getItems() { return items; }
    public void setItems(List<CartItemValidationResult> items) { this.items = items; }
}
