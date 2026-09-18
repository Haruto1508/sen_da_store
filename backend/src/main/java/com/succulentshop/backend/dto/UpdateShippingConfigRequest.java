package com.succulentshop.backend.dto;

import java.util.List;

public class UpdateShippingConfigRequest {

    private Boolean freeShippingEnabled;
    private Integer freeShippingThreshold;
    private Integer defaultShippingFee;
    private List<ShippingConfigResponse.ShippingRateDto> provinceRates;

    public Boolean getFreeShippingEnabled() { return freeShippingEnabled; }
    public void setFreeShippingEnabled(Boolean freeShippingEnabled) { this.freeShippingEnabled = freeShippingEnabled; }

    public Integer getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(Integer freeShippingThreshold) { this.freeShippingThreshold = freeShippingThreshold; }

    public Integer getDefaultShippingFee() { return defaultShippingFee; }
    public void setDefaultShippingFee(Integer defaultShippingFee) { this.defaultShippingFee = defaultShippingFee; }

    public List<ShippingConfigResponse.ShippingRateDto> getProvinceRates() { return provinceRates; }
    public void setProvinceRates(List<ShippingConfigResponse.ShippingRateDto> provinceRates) { this.provinceRates = provinceRates; }
}
