package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.GoogleLoginRequest;
import com.succulentshop.backend.dto.LoginRequest;
import com.succulentshop.backend.dto.PasswordResetDto.*;
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
     * Đăng nhập tài khoản
     */
    @PostMapping("/login")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResult<Map<String, Object>>> login(@RequestBody LoginRequest request) {
        Map<String, Object> result = authService.login(request.getEmail(), request.getPassword());
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
     * Đăng ký tài khoản mới
     */
    @PostMapping("/register")
    @SuppressWarnings("unchecked")
    public ResponseEntity<ApiResult<Map<String, Object>>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getPassword(),
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

    /**
     * Yêu cầu gửi mã OTP khôi phục mật khẩu
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResult<Map<String, Object>>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String demoOtp = authService.requestOtp(request.getEmailOrPhone());

        return ResponseEntity.ok(ApiResult.ok(
            "Mã xác thực OTP đã được tạo thành công.",
            Map.of("demoOtp", demoOtp)
        ));
    }

    /**
     * Đặt lại mật khẩu bằng mã OTP
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResult<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmailOrPhone(), request.getOtp(), request.getNewPassword());

        return ResponseEntity.ok(ApiResult.ok(
            "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay.",
            null
        ));
    }

    /**
     * Đổi mật khẩu cho tài khoản
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResult<Void>> changePassword(@RequestBody ChangePasswordRequest request) {
        authService.changePassword(request.getEmail(), request.getCurrentPassword(), request.getNewPassword());

        return ResponseEntity.ok(ApiResult.ok(
            "Cập nhật mật khẩu mới thành công!",
            null
        ));
    }

    /**
     * Thiết lập mật khẩu cho tài khoản Google chưa có mật khẩu
     */
    @PostMapping("/set-password")
    public ResponseEntity<ApiResult<Map<String, Object>>> setPassword(
            @RequestBody com.succulentshop.backend.dto.SetPasswordRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Map<String, Object> result = authService.setPassword(request, authHeader);
        return ResponseEntity.ok(ApiResult.ok(
            "Thiết lập mật khẩu thành công! Giờ đây bạn có thể đăng nhập bằng Email và Mật khẩu.",
            result
        ));
    }

    /**
     * Kiểm tra trạng thái email (kiểm tra tài khoản Google chưa có mật khẩu)
     */
    @GetMapping("/check-email")
    public ResponseEntity<ApiResult<Map<String, Object>>> checkEmail(@RequestParam String email) {
        Map<String, Object> result = authService.checkEmailStatus(email);
        return ResponseEntity.ok(ApiResult.ok("Kiểm tra email thành công", result));
    }
}
