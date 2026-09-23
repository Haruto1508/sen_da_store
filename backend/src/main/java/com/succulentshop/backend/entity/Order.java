package com.succulentshop.backend.entity;

import com.succulentshop.backend.constant.OrderStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, length = 36)
    private String publicId;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false)
    private String customerAddress;

    @Column(name = "customer_email")
    private String customerEmail;

    private String note;
    private String paymentMethod; // 'vietqr' | 'cod'

    private Integer subtotal;
    private Integer discountAmount;
    private String discountCode;
    private Integer shippingFee;
    private Integer totalAmount;

    private String status; // 'PENDING' | 'PAID' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'

    @Column(name = "stock_deducted", nullable = false)
    private Boolean stockDeducted = false;

    @Column(name = "points_awarded", nullable = false)
    private Boolean pointsAwarded = false;

    private Instant createdAt;
    private Instant completedAt;

    private String returnReason;
    private String returnNote;
    private String refundBankInfo;
    private Instant returnRequestedAt;
    private Instant returnedAt;
    private String returnRejectReason;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
        this.publicId = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
        this.status = OrderStatus.PENDING.getCode();
        this.stockDeducted = false;
        this.pointsAwarded = false;
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    // Getters and Setters
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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public Boolean isStockDeducted() { return stockDeducted != null && stockDeducted; }
    public Boolean getStockDeducted() { return stockDeducted; }
    public void setStockDeducted(Boolean stockDeducted) { this.stockDeducted = stockDeducted; }

    public Boolean isPointsAwarded() { return pointsAwarded != null && pointsAwarded; }
    public Boolean getPointsAwarded() { return pointsAwarded; }
    public void setPointsAwarded(Boolean pointsAwarded) { this.pointsAwarded = pointsAwarded; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }

    public String getReturnNote() { return returnNote; }
    public void setReturnNote(String returnNote) { this.returnNote = returnNote; }

    public String getRefundBankInfo() { return refundBankInfo; }
    public void setRefundBankInfo(String refundBankInfo) { this.refundBankInfo = refundBankInfo; }

    public Instant getReturnRequestedAt() { return returnRequestedAt; }
    public void setReturnRequestedAt(Instant returnRequestedAt) { this.returnRequestedAt = returnRequestedAt; }

    public Instant getReturnedAt() { return returnedAt; }
    public void setReturnedAt(Instant returnedAt) { this.returnedAt = returnedAt; }

    public String getReturnRejectReason() { return returnRejectReason; }
    public void setReturnRejectReason(String returnRejectReason) { this.returnRejectReason = returnRejectReason; }
}
