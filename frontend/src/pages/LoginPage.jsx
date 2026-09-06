import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Sprout, 
  LogIn, 
  CheckCircle2,
  Gift,
  HelpCircle
} from 'lucide-react';
import { loginUser } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigate, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginUser(email.trim(), password);
      if (res.success && res.data) {
        if (addToast) {
          addToast(`Chào mừng bạn trở lại, ${res.data.name}!`, 'info');
        }
        if (onLoginSuccess) {
          onLoginSuccess(res.data, rememberMe);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập không thành công. Hãy thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Fill & Login
  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
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
                <span>Sen Xinh Garden</span>
              </div>
              <h2 className="auth-banner-title">
                Chăm Chút Từng Mầm Xanh, Gửi Trọn Niềm An Yên
              </h2>
              <p className="auth-banner-desc">
                Đăng nhập để theo dõi hành trình đơn hàng, lưu lại bộ sưu tập sen đá yêu thích và nhận ngàn ưu đãi thành viên độc quyền.
              </p>
            </div>

            {/* Benefit Highlights */}
            <div className="auth-benefits-list">
              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <Gift size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Ưu Đãi Thành Viên Độc Quyền</h4>
                  <p>Tích điểm mầm xanh đổi quà và nhận voucher giảm đến 20%</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <Sparkles size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Theo Dõi Trực Quan Vận Chuyển</h4>
                  <p>Cập nhật trạng thái từng bước đơn hàng từ vườn ươm đến tận tay</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Bảo Hành Cây Khỏe 7 Ngày</h4>
                  <p>Cam kết 1 đổi 1 nhanh chóng nếu cây gặp vấn đề trong vận chuyển</p>
                </div>
              </div>
            </div>

            {/* Banner Bottom Note */}
            <div className="auth-banner-footer">
              <span>Hơn 10.000+ người yêu sen đá tin chọn</span>
              <span>⭐ 4.9/5 đánh giá</span>
            </div>
          </div>

          {/* Right Form Content */}
          <div className="auth-content">
            <div className="auth-form-header">
              {/* Tab Switcher */}
              <div className="auth-tab-switch">
                <button 
                  className="auth-tab-btn active"
                  type="button"
                >
                  Đăng Nhập
                </button>
                <button 
                  className="auth-tab-btn"
                  type="button"
                  onClick={() => onNavigate('register')}
                >
                  Đăng Ký Mới
                </button>
              </div>

              <h1 className="auth-title">Chào Mừng Trở Lại!</h1>
              <p className="auth-subtitle">
                Đăng nhập vào tài khoản của bạn để tiếp tục trải nghiệm
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="auth-error-msg" style={{ marginBottom: '16px', fontSize: '0.86rem', padding: '10px 14px', background: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                <HelpCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Email / Username Field */}
              <div className="auth-field">
                <label htmlFor="login-email">Email hoặc Số điện thoại</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    id="login-email"
                    type="text"
                    className={`auth-input ${errorMsg ? 'has-error' : ''}`}
                    placeholder="VD: long.senxinh@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-field">
                <label htmlFor="login-password">
                  <span>Mật khẩu</span>
                  <a 
                    href="#forgot-password" 
                    className="auth-link"
                    style={{ fontSize: '0.82rem' }}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('password');
                    }}
                  >
                    Quên mật khẩu?
                  </a>
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input ${errorMsg ? 'has-error' : ''}`}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="auth-meta-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span>Đang đăng nhập...</span>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Đăng Nhập Ngay</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Box */}
            <div className="auth-demo-card">
              <div className="auth-demo-title">
                <Sparkles size={14} color="var(--primary)" />
                <span>Thử nghiệm nhanh với 1 chạm:</span>
              </div>
              <div className="auth-demo-actions">
                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => handleQuickLogin('long.senxinh@gmail.com', '123456')}
                  title="Điền tài khoản Khách quen"
                >
                  <CheckCircle2 size={14} color="#059669" />
                  <span>Khách Thân Thiết</span>
                </button>
                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={() => handleQuickLogin('admin@senxinh.vn', 'admin123')}
                  title="Điền tài khoản Quản trị viên"
                >
                  <ShieldCheck size={14} color="#2563EB" />
                  <span>Quản Trị Viên</span>
                </button>
              </div>
            </div>

            {/* Social Separator */}
            <div className="auth-separator">
              <span>hoặc đăng nhập bằng</span>
            </div>

            {/* Social Buttons */}
            <div className="auth-social-row">
              <button 
                type="button" 
                className="auth-social-btn"
                onClick={() => {
                  handleQuickLogin('long.senxinh@gmail.com', '123456');
                  if (addToast) addToast('Đã kết nối tài khoản Google thành công!', 'info');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button 
                type="button" 
                className="auth-social-btn"
                onClick={() => {
                  handleQuickLogin('long.senxinh@gmail.com', '123456');
                  if (addToast) addToast('Đã kết nối tài khoản Facebook thành công!', 'info');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* Switch to Register */}
            <p className="auth-switch-prompt">
              Chưa có tài khoản Sen Xinh?{' '}
              <a 
                href="#register" 
                className="auth-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('register');
                }}
              >
                Đăng ký thành viên ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
