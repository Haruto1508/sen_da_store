package com.succulentshop.backend.dto;

import java.util.List;

public class ShippingConfigResponse {

    private Boolean freeShippingEnabled;
    private Integer freeShippingThreshold;
    private Integer defaultShippingFee;
    private List<ShippingRateDto> provinceRates;

    public static class ShippingRateDto {
        private String id;
        private String province;
        private Integer fee;
        private String estimatedDays;
        private String note;

        public ShippingRateDto() {
        }

        public ShippingRateDto(String id, String province, Integer fee, String estimatedDays, String note) {
            this.id = id;
            this.province = province;
            this.fee = fee;
            this.estimatedDays = estimatedDays;
            this.note = note;
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
    }

    public ShippingConfigResponse() {
    }

    public ShippingConfigResponse(Boolean freeShippingEnabled, Integer freeShippingThreshold, Integer defaultShippingFee, List<ShippingRateDto> provinceRates) {
        this.freeShippingEnabled = freeShippingEnabled;
        this.freeShippingThreshold = freeShippingThreshold;
        this.defaultShippingFee = defaultShippingFee;
        this.provinceRates = provinceRates;
    }

    public Boolean getFreeShippingEnabled() { return freeShippingEnabled; }
    public void setFreeShippingEnabled(Boolean freeShippingEnabled) { this.freeShippingEnabled = freeShippingEnabled; }

    public Integer getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(Integer freeShippingThreshold) { this.freeShippingThreshold = freeShippingThreshold; }

    public Integer getDefaultShippingFee() { return defaultShippingFee; }
    public void setDefaultShippingFee(Integer defaultShippingFee) { this.defaultShippingFee = defaultShippingFee; }

    public List<ShippingRateDto> getProvinceRates() { return provinceRates; }
    public void setProvinceRates(List<ShippingRateDto> provinceRates) { this.provinceRates = provinceRates; }
}
