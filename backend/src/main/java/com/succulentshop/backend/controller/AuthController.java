package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.LoginRequest;
import com.succulentshop.backend.dto.PasswordResetDto.*;
import com.succulentshop.backend.dto.RegisterRequest;
import com.succulentshop.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Đăng nhập tài khoản
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Map<String, Object> result = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đăng nhập thành công!",
            "data", result.get("user"),
            "token", result.get("token")
        ));
    }

    /**
     * Đăng ký tài khoản mới
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword(),
                request.getAddress()
        );

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đăng ký thành công! Chào mừng bạn đến với Sen Xinh Garden.",
            "data", result.get("user"),
            "token", result.get("token")
        ));
    }

    /**
     * Yêu cầu gửi mã OTP khôi phục mật khẩu
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String demoOtp = authService.requestOtp(request.getEmailOrPhone());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Mã xác thực OTP đã được tạo thành công.",
            "demoOtp", demoOtp
        ));
    }

    /**
     * Đặt lại mật khẩu bằng mã OTP
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmailOrPhone(), request.getOtp(), request.getNewPassword());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay."
        ));
    }

    /**
     * Đổi mật khẩu cho tài khoản
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        authService.changePassword(request.getEmail(), request.getCurrentPassword(), request.getNewPassword());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cập nhật mật khẩu mới thành công!"
        ));
    }
}
