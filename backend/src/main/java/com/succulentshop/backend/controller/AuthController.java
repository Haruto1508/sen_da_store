package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.GoogleLoginRequest;
import com.succulentshop.backend.dto.LoginRequest;
import com.succulentshop.backend.dto.RegisterRequest;
import com.succulentshop.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Đăng nhập tài khoản bằng Email (Passwordless)
     */
    @PostMapping("/login")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResult<Map<String, Object>>> login(@RequestBody LoginRequest request) {
        Map<String, Object> result = authService.login(request.getEmail());
        Map<String, Object> userData = new LinkedHashMap<>((Map<String, Object>) result.get("user"));
        if (result.containsKey("token")) {
            userData.put("token", result.get("token"));
        }
        return ResponseEntity.ok(ApiResult.ok("Đăng nhập thành công!", userData));
    }

    /**
     * Đăng nhập / Đăng ký nhanh qua Google OAuth2
     */
    @PostMapping("/google")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResult<Map<String, Object>>> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        Map<String, Object> result = authService.loginWithGoogle(request);
        Map<String, Object> userData = new LinkedHashMap<>((Map<String, Object>) result.get("user"));
        if (result.containsKey("token")) {
            userData.put("token", result.get("token"));
        }
        return ResponseEntity.ok(ApiResult.ok("Đăng nhập Google thành công!", userData));
    }

    /**
     * Đăng ký tài khoản mới không cần mật khẩu
     */
    @PostMapping("/register")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResult<Map<String, Object>>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
        );
        Map<String, Object> userData = new LinkedHashMap<>((Map<String, Object>) result.get("user"));
        if (result.containsKey("token")) {
            userData.put("token", result.get("token"));
        }

        return ResponseEntity.ok(ApiResult.ok(
            "Đăng ký thành công! Chào mừng bạn đến với Sen Xinh Garden.",
            userData
        ));
    }
}
