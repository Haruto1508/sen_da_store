package com.succulentshop.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gửi email chứa mã xác thực OTP 6 số
     * @param toEmail Địa chỉ người nhận
     * @param otpCode Mã OTP 6 số
     * @return true nếu gửi email thành công qua SMTP; false nếu chưa cấu hình hoặc lỗi
     */
    public boolean sendOtpEmail(String toEmail, String otpCode) {
        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.info("ℹ️ [EMAIL] Chưa cấu hình SMTP Mail (MAIL_USERNAME). Mã OTP sinh nội bộ: [{}] gửi đến [{}]", otpCode, toEmail);
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Sen Xinh Garden");
            helper.setTo(toEmail);
            helper.setSubject("[Sen Xinh Garden] Mã xác thực OTP đăng nhập: " + otpCode);

            String htmlContent = buildOtpEmailHtml(otpCode);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ [EMAIL] Đã gửi thành công email chứa mã OTP đến: {}", toEmail);
            return true;
        } catch (Exception e) {
            log.warn("⚠️ [EMAIL] Gửi email thất bại đến {}: {}. Mã OTP vẫn có hiệu lực: {}", toEmail, e.getMessage(), otpCode);
            return false;
        }
    }

    private String buildOtpEmailHtml(String otpCode) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
                    .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                    .header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
                    .header h1 { color: #2e7d32; font-size: 22px; margin: 0; }
                    .content { padding: 24px 0; text-align: center; }
                    .otp-box { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b5e20; background: #e8f5e9; padding: 18px 24px; border-radius: 10px; display: inline-block; margin: 16px 0; font-family: monospace; border: 1px solid #c8e6c9; }
                    .notice { color: #64748b; font-size: 13px; line-height: 1.6; }
                    .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <h1>🌿 VƯỜN SEN XINH</h1>
                        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Mã Xác Thực Đăng Nhập Tài Khoản</p>
                    </div>
                    <div class="content">
                        <p style="color: #334155; font-size: 15px; margin-bottom: 8px;">Xin chào quý khách,</p>
                        <p style="color: #64748b; font-size: 14px; margin: 0;">Mã xác thực OTP gồm 6 chữ số để truy cập vào tài khoản của bạn là:</p>
                        <div class="otp-box">%s</div>
                        <p class="notice">Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>.<br/>Vì lý do an toàn, vui lòng không chia sẻ mã này cho bất kỳ ai khác.</p>
                    </div>
                    <div class="footer">
                        <p>Sen Xinh Garden - Vườn sen đá & cây cảnh phong thủy thuần dưỡng tự nhiên</p>
                        <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                    </div>
                </div>
            </body>
            </html>
            """, otpCode);
    }
}
