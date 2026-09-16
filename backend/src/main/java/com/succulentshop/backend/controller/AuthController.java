package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.AuthResponse;
import com.succulentshop.backend.dto.GoogleLoginRequest;
import com.succulentshop.backend.dto.LoginRequest;
import com.succulentshop.backend.dto.RegisterRequest;
import com.succulentshop.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResult<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse result = authService.login(request.getEmail());
        return ResponseEntity.ok(ApiResult.ok("Đăng nhập thành công!", result));
    }

    /**
     * Đăng nhập / Đăng ký nhanh qua Google OAuth2
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResult<AuthResponse>> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        AuthResponse result = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResult.ok("Đăng nhập Google thành công!", result));
    }

    /**
     * Đăng ký tài khoản mới không cần mật khẩu
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResult<AuthResponse>> register(@RequestBody RegisterRequest request) {
        AuthResponse result = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress()
        );

        return ResponseEntity.ok(ApiResult.ok(
            "Đăng ký thành công! Chào mừng bạn đến với Sen Xinh Garden.",
            result
        ));
    }
}
