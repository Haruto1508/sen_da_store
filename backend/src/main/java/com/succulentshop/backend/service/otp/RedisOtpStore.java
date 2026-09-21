package com.succulentshop.backend.service.otp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Quản lý OTP sử dụng Redis với TTL tự động hủy và atomic counter.
 * Tích hợp sẵn cơ chế Graceful In-Memory Fallback khi Redis chưa chạy hoặc ngắt kết nối.
 */
@Component
public class RedisOtpStore implements OtpStore {

    private static final Logger log = LoggerFactory.getLogger(RedisOtpStore.class);

    private static final String KEY_PREFIX_OTP = "senxinh:otp:code:";
    private static final String KEY_PREFIX_COOLDOWN = "senxinh:otp:cooldown:";
    private static final String KEY_PREFIX_ATTEMPTS = "senxinh:otp:attempts:";

    private final StringRedisTemplate redisTemplate;

    // Fallback in-memory storage
    private final Map<String, InMemoryOtp> inMemoryStore = new ConcurrentHashMap<>();

    private static class InMemoryOtp {
        String code;
        LocalDateTime expiry;
        LocalDateTime createdAt;
        int failedAttempts;

        InMemoryOtp(String code, int expirySeconds) {
            this.code = code;
            this.createdAt = LocalDateTime.now();
            this.expiry = LocalDateTime.now().plusSeconds(expirySeconds);
            this.failedAttempts = 0;
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiry);
        }
    }

    public RedisOtpStore() {
        this.redisTemplate = null;
    }

    @Autowired(required = false)
    public RedisOtpStore(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void saveOtp(String email, String code, int expirySeconds) {
        String cleanEmail = normalizeEmail(email);
        try {
            if (redisTemplate != null) {
                String codeKey = KEY_PREFIX_OTP + cleanEmail;
                String attemptsKey = KEY_PREFIX_ATTEMPTS + cleanEmail;

                redisTemplate.opsForValue().set(codeKey, code, expirySeconds, TimeUnit.SECONDS);
                redisTemplate.delete(attemptsKey);
                log.debug("💾 [REDIS OTP] Đã lưu OTP vào Redis cho {}", cleanEmail);
                return;
            }
        } catch (Exception e) {
            log.warn("⚠️ [REDIS OTP] Lỗi kết nối Redis khi lưu OTP, chuyển sang in-memory fallback: {}", e.getMessage());
        }

        inMemoryStore.put(cleanEmail, new InMemoryOtp(code, expirySeconds));
    }

    @Override
    public String getOtp(String email) {
        String cleanEmail = normalizeEmail(email);
        try {
            if (redisTemplate != null) {
                String code = redisTemplate.opsForValue().get(KEY_PREFIX_OTP + cleanEmail);
                if (code != null) return code;
            }
        } catch (Exception e) {
            log.warn("⚠️ [REDIS OTP] Lỗi kết nối Redis khi lấy OTP, chuyển sang in-memory fallback: {}", e.getMessage());
        }

        InMemoryOtp entry = inMemoryStore.get(cleanEmail);
        if (entry != null && !entry.isExpired()) {
            return entry.code;
        }
        return null;
    }

    @Override
    public long getCooldownSecondsRemaining(String email, int cooldownSeconds) {
        String cleanEmail = normalizeEmail(email);
        try {
            if (redisTemplate != null) {
                Long expire = redisTemplate.getExpire(KEY_PREFIX_COOLDOWN + cleanEmail, TimeUnit.SECONDS);
                if (expire != null && expire > 0) {
                    return expire;
                }
                return 0;
            }
        } catch (Exception e) {
            log.warn("⚠️ [REDIS OTP] Lỗi kiểm tra cooldown từ Redis, chuyển sang in-memory fallback: {}", e.getMessage());
        }

        InMemoryOtp entry = inMemoryStore.get(cleanEmail);
        if (entry != null && !entry.isExpired()) {
            long secondsSinceCreated = Duration.between(entry.createdAt, LocalDateTime.now()).getSeconds();
            if (secondsSinceCreated < cooldownSeconds) {
                return cooldownSeconds - secondsSinceCreated;
            }
        }
        return 0;
    }

    @Override
    public void setCooldown(String email, int cooldownSeconds) {
        String cleanEmail = normalizeEmail(email);
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(
                        KEY_PREFIX_COOLDOWN + cleanEmail,
                        "1",
                        cooldownSeconds,
                        TimeUnit.SECONDS
                );
            }
        } catch (Exception e) {
            log.warn("⚠️ [REDIS OTP] Lỗi ghi cooldown vào Redis: {}", e.getMessage());
        }
    }

    @Override
    public int incrementFailedAttempts(String email, int expirySeconds) {
        String cleanEmail = normalizeEmail(email);
        try {
            if (redisTemplate != null) {
                String attemptsKey = KEY_PREFIX_ATTEMPTS + cleanEmail;
                Long count = redisTemplate.opsForValue().increment(attemptsKey);
                if (count != null && count == 1) {
                    redisTemplate.expire(attemptsKey, expirySeconds, TimeUnit.SECONDS);
                }
                return count != null ? count.intValue() : 1;
            }
        } catch (Exception e) {
            log.warn("⚠️ [REDIS OTP] Lỗi tăng số lần nhập sai trên Redis, chuyển sang in-memory fallback: {}", e.getMessage());
        }

        InMemoryOtp entry = inMemoryStore.get(cleanEmail);
        if (entry != null) {
            return ++entry.failedAttempts;
        }
        return 1;
    }

    @Override
    public void removeOtp(String email) {
        String cleanEmail = normalizeEmail(email);
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(KEY_PREFIX_OTP + cleanEmail);
                redisTemplate.delete(KEY_PREFIX_ATTEMPTS + cleanEmail);
            }
        } catch (Exception e) {
            log.warn("⚠️ [REDIS OTP] Lỗi xóa OTP trên Redis: {}", e.getMessage());
        }
        inMemoryStore.remove(cleanEmail);
    }

    @Override
    public boolean exists(String email) {
        String cleanEmail = normalizeEmail(email);
        try {
            if (redisTemplate != null) {
                Boolean hasKey = redisTemplate.hasKey(KEY_PREFIX_OTP + cleanEmail);
                if (Boolean.TRUE.equals(hasKey)) return true;
            }
        } catch (Exception e) {
            log.warn("⚠️ [REDIS OTP] Lỗi kiểm tra tồn tại OTP trên Redis: {}", e.getMessage());
        }
        InMemoryOtp entry = inMemoryStore.get(cleanEmail);
        return entry != null && !entry.isExpired();
    }

    private String normalizeEmail(String email) {
        return (email == null) ? "" : email.trim().toLowerCase();
    }
}
