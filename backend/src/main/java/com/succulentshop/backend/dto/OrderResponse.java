package com.succulentshop.backend.dto;

import java.util.List;

public class OrderResponse {
    private Long id;
    private String publicId;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String customerEmail;
    private String note;
    private String paymentMethod;
    private List<OrderItemResponse> items;
    private Integer subtotal;
    private Integer discountAmount;
    private String discountCode;
    private Integer shippingFee;
    private Integer totalAmount;
    private String status;
    private Boolean stockDeducted;
    private Boolean pointsAwarded;
    private String createdAt;
    private String completedAt;
    private String returnReason;
    private String returnNote;
    private String refundBankInfo;
    private String returnRequestedAt;
    private String returnedAt;
    private String returnRejectReason;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }

    public Integer getSubtotal() { return subtotal; }
    public void setSubtotal(Integer subtotal) { this.subtotal = subtotal; }

    public Integer getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Integer discountAmount) { this.discountAmount = discountAmount; }

    public String getDiscountCode() { return discountCode; }
    public void setDiscountCode(String discountCode) { this.discountCode = discountCode; }

    public Integer getShippingFee() { return shippingFee; }
    public void setShippingFee(Integer shippingFee) { this.shippingFee = shippingFee; }

    public Integer getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Integer totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Boolean getStockDeducted() { return stockDeducted; }
    public void setStockDeducted(Boolean stockDeducted) { this.stockDeducted = stockDeducted; }

    public Boolean getPointsAwarded() { return pointsAwarded; }
    public void setPointsAwarded(Boolean pointsAwarded) { this.pointsAwarded = pointsAwarded; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }

    public String getReturnNote() { return returnNote; }
    public void setReturnNote(String returnNote) { this.returnNote = returnNote; }

    public String getRefundBankInfo() { return refundBankInfo; }
    public void setRefundBankInfo(String refundBankInfo) { this.refundBankInfo = refundBankInfo; }

    public String getReturnRequestedAt() { return returnRequestedAt; }
    public void setReturnRequestedAt(String returnRequestedAt) { this.returnRequestedAt = returnRequestedAt; }

    public String getReturnedAt() { return returnedAt; }
    public void setReturnedAt(String returnedAt) { this.returnedAt = returnedAt; }

    public String getReturnRejectReason() { return returnRejectReason; }
    public void setReturnRejectReason(String returnRejectReason) { this.returnRejectReason = returnRejectReason; }
}
