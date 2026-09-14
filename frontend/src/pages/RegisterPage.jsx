import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
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
    agreeTerms: true
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên và email!');
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
        phone: formData.phone.trim()
      });

      if (res.success && res.data) {
        if (addToast) {
          addToast(`Chào mừng thành viên mới: ${res.data.name}! Bạn được tặng mã SENMOI50 🌿`, 'info');
        }
        if (onRegisterSuccess) {
          onRegisterSuccess(res.data);
        }
      }
    } catch (err) {
      console.error('Lỗi đăng ký tài khoản:', err);
      const msg = err.message || '';
      const friendlyMsg = (!msg || msg.includes('Failed to fetch'))
        ? 'Không thể kết nối đến máy chủ. Quý khách vui lòng thử lại sau!'
        : msg;
      setErrorMsg(friendlyMsg);
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
              <div 
                className="auth-brand-badge"
                onClick={() => onNavigate && onNavigate('home')}
                style={{ cursor: 'pointer' }}
                title="Quay lại Trang Chủ Sen Xinh"
              >
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

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="reg-email">Địa chỉ Email</label>
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

              {/* Phone */}
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
                    Tôi đồng ý với <a href="#/" className="auth-link">Điều khoản dịch vụ</a> và <a href="#/" className="auth-link">Chính sách bảo mật</a> của Sen Xinh Garden.
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
                href="#/login" 
                className="auth-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('login');
                }}
              >
                Đăng nhập ngay
              </a>
            </p>

            {/* Back to Home Link */}
            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('home')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ← Quay lại trang chủ mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
