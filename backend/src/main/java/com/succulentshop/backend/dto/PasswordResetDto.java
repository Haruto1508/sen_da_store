package com.succulentshop.backend.dto;

public class PasswordResetDto {

    public static class ForgotPasswordRequest {
        private String emailOrPhone;

        public String getEmailOrPhone() { return emailOrPhone; }
        public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }
    }

    public static class ResetPasswordRequest {
        private String emailOrPhone;
        private String otp;
        private String newPassword;

        public String getEmailOrPhone() { return emailOrPhone; }
        public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class ChangePasswordRequest {
        private String email;
        private String currentPassword;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
