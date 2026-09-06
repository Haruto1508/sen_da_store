package com.succulentshop.backend.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class MoMoSecurityUtil {

    private static final String HMAC_SHA256 = "HmacSHA256";

    /**
     * Ký dữ liệu với thuật toán HMAC-SHA256 và trả về chuỗi Hexadecimal
     */
    public static String signHmacSHA256(String data, String secretKey) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Lỗi tính toán chữ ký HMAC-SHA256 cho MoMo: " + e.getMessage(), e);
        }
    }

    /**
     * Chuyển đổi mảng byte sang chuỗi Hex
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
