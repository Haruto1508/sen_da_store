package com.succulentshop.backend.controller;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.AuthResponse;
import com.succulentshop.backend.dto.GoogleLoginRequest;
import com.succulentshop.backend.dto.LoginRequest;
import com.succulentshop.backend.dto.RegisterRequest;
import com.succulentshop.backend.dto.SendOtpRequest;
import com.succulentshop.backend.dto.SendOtpResponse;
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
     * Gửi mã xác thực OTP 6 số về Email
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResult<SendOtpResponse>> sendOtp(@RequestBody SendOtpRequest request) {
        SendOtpResponse result = authService.sendOtp(request.getEmail());
        return ResponseEntity.ok(ApiResult.ok(MessageCode.OTP_SENT, result));
    }

    /**
     * Đăng nhập tài khoản bằng Mật khẩu hoặc mã OTP
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResult<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse result = authService.login(request.getEmail(), request.getPassword(), request.getOtp());
        return ResponseEntity.ok(ApiResult.ok(MessageCode.LOGIN_SUCCESS, result));
    }

    /**
     * Đăng nhập / Đăng ký nhanh qua Google OAuth2
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResult<AuthResponse>> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        AuthResponse result = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.GOOGLE_LOGIN_SUCCESS, result));
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

        return ResponseEntity.ok(ApiResult.ok(MessageCode.REGISTER_SUCCESS, result));
    }
}
