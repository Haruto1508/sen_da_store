package com.succulentshop.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_rates")
public class ShippingRate {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String province;

    @Column(nullable = false)
    private Integer fee;

    @Column(name = "estimated_days")
    private String estimatedDays;

    private String note;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public ShippingRate() {
    }

    public ShippingRate(String id, String province, Integer fee, String estimatedDays, String note) {
        this.id = id;
        this.province = province;
        this.fee = fee;
        this.estimatedDays = estimatedDays;
        this.note = note;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public Integer getFee() { return fee; }
    public void setFee(Integer fee) { this.fee = fee; }

    public String getEstimatedDays() { return estimatedDays; }
    public void setEstimatedDays(String estimatedDays) { this.estimatedDays = estimatedDays; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
