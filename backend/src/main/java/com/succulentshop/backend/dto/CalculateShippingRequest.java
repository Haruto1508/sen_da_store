package com.succulentshop.backend.dto;

public class CalculateShippingRequest {
    private Integer subtotal;
    private String city;
    private String address;

    public CalculateShippingRequest() {}

    public CalculateShippingRequest(Integer subtotal, String city, String address) {
        this.subtotal = subtotal;
        this.city = city;
        this.address = address;
    }

    public Integer getSubtotal() { return subtotal; }
    public void setSubtotal(Integer subtotal) { this.subtotal = subtotal; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
