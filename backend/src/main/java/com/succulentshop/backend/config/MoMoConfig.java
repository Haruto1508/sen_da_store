package com.succulentshop.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MoMoConfig {

    @Value("${momo.partner-code:MOMOBKUN20180529}")
    private String partnerCode;

    @Value("${momo.access-key:klm05TvNBzhg7hZ8}")
    private String accessKey;

    @Value("${momo.secret-key:at67qH6mk8w5Y1nAyMoYKMWACiEi2Aca}")
    private String secretKey;

    @Value("${momo.api-url:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String apiUrl;

    @Value("${momo.redirect-url:http://localhost:5173/#order-success}")
    private String redirectUrl;

    @Value("${momo.ipn-url:http://localhost:8080/api/payment/momo-ipn}")
    private String ipnUrl;

    public String getPartnerCode() {
        return partnerCode;
    }

    public String getAccessKey() {
        return accessKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public String getIpnUrl() {
        return ipnUrl;
    }
}
