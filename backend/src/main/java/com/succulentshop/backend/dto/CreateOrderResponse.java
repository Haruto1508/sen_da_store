package com.succulentshop.backend.dto;

public class CreateOrderResponse {
    private OrderResponse order;
    private VietQrResponse vietQr;

    public OrderResponse getOrder() { return order; }
    public void setOrder(OrderResponse order) { this.order = order; }

    public VietQrResponse getVietQr() { return vietQr; }
    public void setVietQr(VietQrResponse vietQr) { this.vietQr = vietQr; }
}
