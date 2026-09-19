package com.succulentshop.backend.dto;

public class AdminStatsResponse {
    private Long totalOrders;
    private Long pendingOrders;
    private Long paidOrders;
    private Long completedOrders;
    private Long totalRevenue;
    private Long totalProducts;
    private Long totalCustomers;
    private Long totalCoupons;

    public AdminStatsResponse() {}

    public AdminStatsResponse(Long totalOrders, Long pendingOrders, Long paidOrders,
                              Long completedOrders, Long totalRevenue, Long totalProducts,
                              Long totalCustomers, Long totalCoupons) {
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.paidOrders = paidOrders;
        this.completedOrders = completedOrders;
        this.totalRevenue = totalRevenue;
        this.totalProducts = totalProducts;
        this.totalCustomers = totalCustomers;
        this.totalCoupons = totalCoupons;
    }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public Long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(Long pendingOrders) { this.pendingOrders = pendingOrders; }

    public Long getPaidOrders() { return paidOrders; }
    public void setPaidOrders(Long paidOrders) { this.paidOrders = paidOrders; }

    public Long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(Long completedOrders) { this.completedOrders = completedOrders; }

    public Long getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Long totalRevenue) { this.totalRevenue = totalRevenue; }

    public Long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Long totalProducts) { this.totalProducts = totalProducts; }

    public Long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(Long totalCustomers) { this.totalCustomers = totalCustomers; }

    public Long getTotalCoupons() { return totalCoupons; }
    public void setTotalCoupons(Long totalCoupons) { this.totalCoupons = totalCoupons; }
}
