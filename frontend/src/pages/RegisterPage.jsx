import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Gift, 
  Sprout, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { registerUser } from '../services/api';

export default function RegisterPage({ onRegisterSuccess, onNavigate, addToast }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { score: 0, label: '', class: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && /[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 1, label: 'Mật khẩu yếu', class: 'weak' };
    if (score === 2) return { score: 2, label: 'Mật khẩu vừa phải', class: 'medium' };
    return { score: 3, label: 'Mật khẩu mạnh & an toàn', class: 'strong' };
  }, [formData.password]);

  const passwordsMatch = useMemo(() => {
    if (!formData.confirmPassword) return null;
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg('Vui lòng điền đầy đủ các trường thông tin bắt buộc!');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự để đảm bảo an toàn.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg('Vui lòng đồng ý với Điều khoản dịch vụ của Sen Xinh Garden.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      if (res.success && res.data) {
        if (addToast) {
          addToast(`Chào mừng thành viên mới: ${res.data.name}! Bạn được tặng mã SENMOI50`, 'info');
        }
        if (onRegisterSuccess) {
          onRegisterSuccess(res.data);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Đăng ký không thành công. Hãy thử lại!');
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
                <span>Gia Nhập Cộng Đồng Sen Xinh</span>
              </div>
              <h2 className="auth-banner-title">
                Khởi Đầu Hành Trình Gieo Mầm Xanh An Yên
              </h2>
              <p className="auth-banner-desc">
                Tạo tài khoản để nhận quà chào mừng đặc biệt và tận hưởng trọn vẹn dịch vụ chăm sóc cây cảnh chuyên nghiệp.
              </p>
            </div>

            {/* Benefits list */}
            <div className="auth-benefits-list">
              <div className="auth-benefit-item" style={{ background: 'rgba(217, 119, 87, 0.2)', borderColor: 'rgba(217, 119, 87, 0.4)' }}>
                <div className="auth-benefit-icon" style={{ background: '#D97757' }}>
                  <Gift size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4 style={{ color: '#FDF1EC' }}>Voucher Chào Mừng 50.000đ</h4>
                  <p>Mã ưu đãi SENMOI50 tự động kích hoạt cho đơn hàng đầu tiên của bạn</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <Sparkles size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Tặng 50 Điểm Thưởng Khởi Đầu</h4>
                  <p>Tích lũy điểm đổi quà chậu gốm thủ công và sen đá quý hiếm</p>
                </div>
              </div>

              <div className="auth-benefit-item">
                <div className="auth-benefit-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="auth-benefit-text">
                  <h4>Bảo Mật Dữ Liệu 100%</h4>
                  <p>Thông tin cá nhân và lịch sử đặt hàng của bạn luôn được bảo vệ tuyệt đối</p>
                </div>
              </div>
            </div>

            <div className="auth-banner-footer">
              <span>Giao lưu cùng 10.000+ người chơi sen đá</span>
              <span>🌱 Tư vấn trồng cây trọn đời</span>
            </div>
          </div>

          {/* Right Form Content */}
          <div className="auth-content">
            <div className="auth-form-header">
              {/* Tab Switcher */}
              <div className="auth-tab-switch">
                <button 
                  className="auth-tab-btn"
                  type="button"
                  onClick={() => onNavigate('login')}
                >
                  Đăng Nhập
                </button>
                <button 
                  className="auth-tab-btn active"
                  type="button"
                >
                  Đăng Ký Mới
                </button>
              </div>

              <h1 className="auth-title">Đăng Ký Tài Khoản</h1>
              <p className="auth-subtitle">
                Chỉ mất 30 giây để trở thành thành viên thân thiết của Sen Xinh Garden
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="auth-error-msg" style={{ marginBottom: '16px', fontSize: '0.86rem', padding: '10px 14px', background: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Register Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="auth-field">
                <label htmlFor="reg-name">Họ và tên của bạn</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <User size={18} />
                  </span>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    className="auth-input"
                    placeholder="VD: Nguyễn Hoàng Long"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email and Phone Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="auth-field">
                  <label htmlFor="reg-email">Email</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      className="auth-input"
                      placeholder="email@vidu.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-phone">Số điện thoại</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <Phone size={18} />
                    </span>
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      className="auth-input"
                      placeholder="0988 123 456"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="reg-password">
                  <span>Mật khẩu</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 'normal' }}>
                    Tối thiểu 6 ký tự
                  </span>
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Tạo mật khẩu an toàn"
                    value={formData.password}
                    onChange={handleChange}
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength-box">
                    <div className="strength-meter-bars">
                      <div className={`strength-meter-bar ${passwordStrength.score >= 1 ? passwordStrength.class : ''}`} />
                      <div className={`strength-meter-bar ${passwordStrength.score >= 2 ? passwordStrength.class : ''}`} />
                      <div className={`strength-meter-bar ${passwordStrength.score >= 3 ? passwordStrength.class : ''}`} />
                    </div>
                    <div className="strength-label-row">
                      <span className="strength-label-text" style={{ 
                        color: passwordStrength.score === 1 ? '#EF4444' : passwordStrength.score === 2 ? '#F59E0B' : '#10B981' 
                      }}>
                        {passwordStrength.label}
                      </span>
                      <span>Độ an toàn</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label htmlFor="reg-confirm-password">
                  <span>Xác nhận mật khẩu</span>
                  {passwordsMatch === true && (
                    <span style={{ color: '#10B981', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={13} /> Khớp mật khẩu
                    </span>
                  )}
                  {passwordsMatch === false && (
                    <span style={{ color: '#EF4444', fontSize: '0.78rem' }}>
                      Chưa khớp
                    </span>
                  )}
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    id="reg-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`auth-input ${passwordsMatch === false ? 'has-error' : ''}`}
                    placeholder="Nhập lại mật khẩu vừa tạo"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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

              {/* Terms Checkbox */}
              <div className="auth-meta-row">
                <label className="auth-checkbox-label" style={{ alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span style={{ fontSize: '0.84rem', lineHeight: 1.4 }}>
                    Tôi đồng ý với <a href="#home" className="auth-link">Điều khoản dịch vụ</a> và <a href="#home" className="auth-link">Chính sách bảo mật</a> của Sen Xinh Garden.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span>Đang khởi tạo tài khoản...</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Hoàn Tất Đăng Ký & Nhận Quà</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <p className="auth-switch-prompt">
              Bạn đã có tài khoản Sen Xinh?{' '}
              <a 
                href="#login" 
                className="auth-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('login');
                }}
              >
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
