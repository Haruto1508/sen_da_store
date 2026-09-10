package com.succulentshop.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName != null ? cloudName.trim() : "");
        config.put("api_key", apiKey != null ? apiKey.trim() : "");
        config.put("api_secret", apiSecret != null ? apiSecret.trim() : "");
        config.put("secure", "true");

        if (cloudName == null || cloudName.isBlank()) {
            log.warn("Cloudinary credentials chưa được cấu hình đầy đủ trong .env. Vui lòng cung cấp CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET để kích hoạt upload ảnh cloud.");
        } else {
            log.info("Cloudinary đã được khởi tạo thành công với cloud_name: {}", cloudName);
        }

        return new Cloudinary(config);
    }
}
