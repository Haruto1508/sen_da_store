import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  KeyRound, 
  Sprout, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { requestPasswordOtp, resetPassword } from '../services/api';

export default function ForgotPasswordPage({ onNavigate, addToast }) {
  // Step: 1 (Request OTP), 2 (Verify OTP), 3 (New Password), 4 (Success)
  const [step, setStep] = useState(1);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMsg('Vui lòng nhập Email hoặc Số điện thoại của bạn!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await requestPasswordOtp(emailOrPhone.trim());
      if (res.success) {
        if (addToast) addToast(res.message, 'info');
        setStep(2);
        setResendCooldown(60);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể gửi mã xác thực. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill demo OTP
  const handleFillDemoOtp = () => {
    setOtp('686868');
    setErrorMsg('');
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg('Vui lòng nhập mã OTP 6 số!');
      return;
    }
    if (otp.trim() !== '686868' && otp.trim() !== '123456') {
      setErrorMsg('Mã OTP không đúng! Nhấn nút "Điền mã thử nghiệm 686868" để tiếp tục.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ mật khẩu mới!');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await resetPassword({
        emailOrPhone: emailOrPhone.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (res.success) {
        if (addToast) addToast('Đặt lại mật khẩu thành công!', 'info');
        setStep(4);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-split-card">
          {/* Left Botanical Showcase */}
          <div className="auth-banner">
            <div className="auth-banner-header">
              <div className="auth-brand-badge">
                <Sprout size={16} />
                <span>Bảo Mật Tài Khoản</span>
              </div>
              <h2 className="auth-banner-title">
                Khôi Phục Mật Khẩu Nhanh Chóng & An Toàn
              </h2>
              <p className="auth-banner-desc">
                Sen Xinh Garden hỗ trợ bạn lấy lại quyền truy cập tài khoản chỉ qua vài bước xác thực đơn giản và tiện lợi.
              </p>
            </div>

            <div className="auth-benefits-list">
              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <KeyRound size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Mã OTP Xác Thực Tức Thì</h4>
                  <p>Mã bảo mật gửi trực tiếp đến hộp thư hoặc tin nhắn SMS của bạn</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Bảo Vệ Đơn Hàng & Điểm Tích Lũy</h4>
                  <p>Toàn bộ giỏ hàng, điểm Sen và lịch sử đơn hàng luôn được bảo lưu an toàn</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <Sparkles size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Hỗ Trợ Trực Tuyến 24/7</h4>
                  <p>Hotline vườn sen: 0988 123 456 (Zalo / Call) luôn sẵn sàng giải đáp</p>
                </div>
              </div>
            </div>

            <div className="auth-banner-footer">
              <span>Được bảo vệ bởi mã hóa dữ liệu 256-bit</span>
              <span>🌿 Sen Xinh Garden</span>
            </div>
          </div>

          {/* Right Form Content */}
          <div className="auth-content">
            {/* Step Progress Bar */}
            <div className="auth-steps-flow">
              <div className={`auth-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="auth-step-circle">{step > 1 ? '✓' : '1'}</div>
                <span className="auth-step-title">Gửi Mã</span>
              </div>
              <div className={`auth-step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="auth-step-circle">{step > 2 ? '✓' : '2'}</div>
                <span className="auth-step-title">Xác Thực</span>
              </div>
              <div className={`auth-step-node ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                <div className="auth-step-circle">{step > 3 ? '✓' : '3'}</div>
                <span className="auth-step-title">Mật Khẩu Mới</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="auth-error-msg" style={{ marginBottom: '16px', fontSize: '0.86rem', padding: '10px 14px', background: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                <HelpCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Request OTP */}
            {step === 1 && (
              <>
                <div className="auth-form-header">
                  <h1 className="auth-title">Quên Mật Khẩu?</h1>
                  <p className="auth-subtitle">
                    Đừng lo lắng! Hãy nhập email hoặc số điện thoại đã đăng ký tài khoản để nhận mã khôi phục.
                  </p>
                </div>

                <form className="auth-form" onSubmit={handleSendOtp}>
                  <div className="auth-field">
                    <label htmlFor="forgot-target">Email hoặc Số điện thoại</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Mail size={18} />
                      </span>
                      <input
                        id="forgot-target"
                        type="text"
                        className="auth-input"
                        placeholder="VD: long.senxinh@gmail.com"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Đang kiểm tra...</span>
                    ) : (
                      <>
                        <span>Gửi Mã Xác Thực OTP</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Hint */}
                <div className="auth-demo-card">
                  <div className="auth-demo-title">
                    <Sparkles size={14} color="var(--primary)" />
                    <span>Tài khoản mẫu để thử nghiệm nhanh:</span>
                  </div>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => setEmailOrPhone('long.senxinh@gmail.com')}
                  >
                    <span>Điền mẫu: <strong>long.senxinh@gmail.com</strong></span>
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Verify OTP */}
            {step === 2 && (
              <>
                <div className="auth-form-header">
                  <h1 className="auth-title">Nhập Mã OTP</h1>
                  <p className="auth-subtitle">
                    Mã xác thực đã được gửi đến <strong>{emailOrPhone}</strong>. Vui lòng kiểm tra và điền vào bên dưới.
                  </p>
                </div>

                <form className="auth-form" onSubmit={handleVerifyOtp}>
                  <div className="auth-field">
                    <label htmlFor="forgot-otp">Mã xác thực 6 chữ số</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <KeyRound size={18} />
                      </span>
                      <input
                        id="forgot-otp"
                        type="text"
                        maxLength="6"
                        className="auth-input"
                        placeholder="Nhập 6 số OTP (VD: 686868)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                  >
                    <span>Xác Thực Mã OTP</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                {/* Quick Autofill Demo Button */}
                <div className="auth-demo-card">
                  <div className="auth-demo-title">
                    <Sparkles size={14} color="var(--primary)" />
                    <span>Thử nghiệm nhanh không cần chờ SMS:</span>
                  </div>
                  <button
                    type="button"
                    className="auth-demo-btn"
                    style={{ width: '100%' }}
                    onClick={handleFillDemoOtp}
                  >
                    <KeyRound size={14} />
                    <span>Tự động điền mã xác thực <strong>686868</strong></span>
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="auth-link"
                    style={{ background: 'none', border: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={14} /> Đổi số điện thoại/email
                  </button>
                  <button
                    type="button"
                    className="auth-link"
                    style={{ background: 'none', border: 'none', fontSize: '0.85rem' }}
                    onClick={() => {
                      if (addToast) addToast('Đã gửi lại mã OTP (Mã mẫu: 686868)', 'info');
                    }}
                  >
                    Gửi lại mã
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 3 && (
              <>
                <div className="auth-form-header">
                  <h1 className="auth-title">Đặt Mật Khẩu Mới</h1>
                  <p className="auth-subtitle">
                    Tạo mật khẩu an toàn mới cho tài khoản của bạn
                  </p>
                </div>

                <form className="auth-form" onSubmit={handleResetPassword}>
                  <div className="auth-field">
                    <label htmlFor="forgot-new-pass">Mật khẩu mới</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Lock size={18} />
                      </span>
                      <input
                        id="forgot-new-pass"
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="forgot-confirm-pass">Xác nhận mật khẩu mới</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Lock size={18} />
                      </span>
                      <input
                        id="forgot-confirm-pass"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="auth-input-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex="-1"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Đang lưu mật khẩu...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Lưu & Đặt Lại Mật Khẩu</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 4: Success View */}
            {step === 4 && (
              <div className="auth-success-box">
                <div className="auth-success-icon-wrap">
                  <CheckCircle2 size={44} />
                </div>
                <h2 className="auth-title" style={{ color: '#059669', marginBottom: '8px' }}>
                  Đổi Mật Khẩu Thành Công!
                </h2>
                <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
                  Mật khẩu tài khoản Sen Xinh của bạn đã được cập nhật an toàn. Bạn có thể đăng nhập ngay bây giờ.
                </p>
                <button
                  type="button"
                  className="auth-submit-btn"
                  onClick={() => onNavigate('login')}
                >
                  <KeyRound size={18} />
                  <span>Đăng Nhập Ngay Với Mật Khẩu Mới</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Bottom Link Back to Login */}
            {step < 4 && (
              <p className="auth-switch-prompt">
                <a 
                  href="#login" 
                  className="auth-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('login');
                  }}
                >
                  <ArrowLeft size={16} /> Quay lại trang Đăng nhập
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
