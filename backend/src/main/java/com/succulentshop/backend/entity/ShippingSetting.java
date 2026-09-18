package com.succulentshop.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_settings")
public class ShippingSetting {

    @Id
    private Integer id;

    @Column(name = "free_shipping_enabled")
    private Boolean freeShippingEnabled = true;

    @Column(name = "free_shipping_threshold")
    private Integer freeShippingThreshold = 200000;

    @Column(name = "default_shipping_fee")
    private Integer defaultShippingFee = 35000;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public ShippingSetting() {
    }

    public ShippingSetting(Integer id, Boolean freeShippingEnabled, Integer freeShippingThreshold, Integer defaultShippingFee) {
        this.id = id;
        this.freeShippingEnabled = freeShippingEnabled;
        this.freeShippingThreshold = freeShippingThreshold;
        this.defaultShippingFee = defaultShippingFee;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Boolean getFreeShippingEnabled() { return freeShippingEnabled; }
    public void setFreeShippingEnabled(Boolean freeShippingEnabled) { this.freeShippingEnabled = freeShippingEnabled; }

    public Integer getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(Integer freeShippingThreshold) { this.freeShippingThreshold = freeShippingThreshold; }

    public Integer getDefaultShippingFee() { return defaultShippingFee; }
    public void setDefaultShippingFee(Integer defaultShippingFee) { this.defaultShippingFee = defaultShippingFee; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
