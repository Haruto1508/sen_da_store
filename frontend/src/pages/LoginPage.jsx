import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Sprout, 
  LogIn, 
  Gift,
  HelpCircle,
  Loader2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCw
} from 'lucide-react';
import { loginUser, loginWithGoogle, sendOtp } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigate, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'

  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Countdown timer cho nút gửi lại OTP
  useEffect(() => {
    let interval = null;
    if (otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Gửi mã OTP về Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập Email của bạn trước khi nhận mã OTP!');
      return;
    }

    setErrorMsg('');
    setInfoMsg('');
    setSendingOtp(true);

    try {
      const res = await sendOtp(cleanEmail);
      setOtpSent(true);
      setOtpCountdown(60);
      const devHint = res.devOtp ? ` [Mã test: ${res.devOtp}]` : '';
      setInfoMsg(res.message || `Mã OTP đã được gửi đến ${cleanEmail}.${devHint}`);
      if (addToast) {
        addToast(`Mã OTP đã gửi đến ${cleanEmail}!${devHint}`, 'info');
      }
    } catch (err) {
      console.error('Lỗi gửi OTP:', err);
      setErrorMsg(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau!');
    } finally {
      setSendingOtp(false);
    }
  };

  // Xử lý gửi biểu mẫu đăng nhập (OTP hoặc Mật Khẩu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập Email của bạn!');
      return;
    }

    if (authMethod === 'otp' && !otp.trim()) {
      setErrorMsg('Vui lòng nhập mã OTP 6 số được gửi về email của bạn!');
      return;
    }

    if (authMethod === 'password' && !password) {
      setErrorMsg('Vui lòng nhập mật khẩu tài khoản của bạn!');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginUser(
        cleanEmail, 
        authMethod === 'password' ? password : '', 
        authMethod === 'otp' ? otp.trim() : ''
      );

      if (res.success && res.data) {
        const displayName = res.data.name || res.data.user?.name || 'bạn';
        const isAdmin = Boolean(
          res.data.role?.toLowerCase().includes('admin') || 
          res.data.email === 'admin@senxinh.vn'
        );

        if (addToast) {
          if (isAdmin) {
            addToast(`Chào mừng Quản trị viên ${displayName}! Chuyển đến trang quản trị... 🌿`, 'success');
          } else {
            addToast(`Chào mừng bạn trở lại, ${displayName}! 🌿`, 'info');
          }
        }

        if (onLoginSuccess) {
          onLoginSuccess(res.data, rememberMe);
        }
      }
    } catch (err) {
      console.error('Lỗi đăng nhập tài khoản:', err);
      const msg = err.message || '';
      const friendlyMsg = (!msg || msg.includes('Failed to fetch'))
        ? 'Không thể kết nối đến máy chủ. Quý khách vui lòng thử lại sau!'
        : msg;
      setErrorMsg(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo Google Identity Services / One Tap khi component mount
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isValidClientId = clientId && !clientId.includes('your-google-client-id') && clientId.trim() !== '';

    if (isValidClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                const res = await loginWithGoogle({ idToken: response.credential });
                if (res.success && res.data) {
                  const displayName = res.data.name || res.data.user?.name || 'bạn';
                  if (addToast) addToast(`Chào mừng bạn trở lại, ${displayName}! 🌿`, 'info');
                  if (onLoginSuccess) onLoginSuccess(res.data, rememberMe);
                }
              } catch (err) {
                console.error('Google One Tap login error:', err);
                setErrorMsg('Đăng nhập Google không thành công. Quý khách vui lòng đăng nhập bằng Email!');
              } finally {
                setLoading(false);
              }
            }
          }
        });
      } catch (e) {
        console.debug('Google One Tap init skipped:', e);
      }
    }
  }, [rememberMe, onLoginSuccess, addToast]);

  // Xử lý khi người dùng nhấn nút "Google"
  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isValidClientId = clientId && !clientId.includes('your-google-client-id') && clientId.trim() !== '';

    if (!isValidClientId) {
      console.warn('[Cấu hình] VITE_GOOGLE_CLIENT_ID chưa được thiết lập trong file .env');
      if (addToast) {
        addToast('Tính năng đăng nhập Google hiện đang được bảo trì. Quý khách vui lòng đăng nhập bằng Email!', 'info');
      }
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      if (addToast) addToast('Đang kết nối dịch vụ Google, vui lòng thử lại sau giây lát...', 'info');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setLoading(false);
            console.error('Google OAuth token error:', tokenResponse.error);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg('Đăng nhập Google không thành công. Quý khách vui lòng thử lại hoặc đăng nhập bằng Email!');
            }
            return;
          }

          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await userInfoRes.json();

            const res = await loginWithGoogle({
              accessToken: tokenResponse.access_token,
              profile
            });

            if (res.success && res.data) {
              const displayName = res.data.name || res.data.user?.name || 'bạn';
              if (addToast) {
                addToast(`Đăng nhập Google thành công! Chào mừng ${displayName} 🌿`, 'info');
              }
              if (onLoginSuccess) {
                onLoginSuccess(res.data, rememberMe);
              }
            }
          } catch (err) {
            console.error('Lỗi khi xử lý thông tin tài khoản Google:', err);
            setErrorMsg('Đăng nhập Google thất bại. Quý khách vui lòng đăng nhập bằng Email!');
          } finally {
            setLoading(false);
          }
        },
        error_callback: (err) => {
          setLoading(false);
          console.error('Google OAuth popup error:', err);
          if (err.type !== 'popup_closed_by_user') {
            setErrorMsg('Cửa sổ đăng nhập Google bị gián đoạn hoặc bị trình duyệt chặn. Vui lòng thử lại!');
          }
        }
      });

      client.requestAccessToken();
    } catch (err) {
      setLoading(false);
      console.error('Không thể mở cửa sổ đăng nhập Google:', err);
      setErrorMsg('Không thể mở cửa sổ đăng nhập Google. Quý khách vui lòng đăng nhập bằng Email!');
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
                <span>Sen Xinh Garden</span>
              </div>
              <h2 className="auth-banner-title">
                Chăm Chút Từng Mầm Xanh, Gửi Trọn Niềm An Yên
              </h2>
              <p className="auth-banner-desc">
                Đăng nhập an toàn để theo dõi hành trình đơn hàng, lưu lại bộ sưu tập sen đá yêu thích và nhận ngàn ưu đãi thành viên độc quyền.
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
                  <h4>Bảo Mật Tài Khoản Tuyệt Đối</h4>
                  <p>Xác thực mã OTP gửi về Email hoặc Mật khẩu bảo vệ an toàn</p>
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
              {/* Trust Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EBF4EE',
                color: 'var(--primary)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '14px'
              }}>
                <ShieldCheck size={14} />
                <span>Đăng Nhập Bảo Mật & An Toàn</span>
              </div>

              <h1 className="auth-title">Chào Mừng Bạn Đến Vườn Sen Xinh! 🌿</h1>
              <p className="auth-subtitle">
                Lựa chọn phương thức xác thực để bảo vệ thông tin tài khoản và đơn hàng
              </p>
            </div>

            {/* Priority 1: Google One-Click Auth */}
            <div className="auth-social-row" style={{ marginBottom: '18px' }}>
              <button 
                type="button" 
                className="auth-social-btn"
                disabled={loading}
                onClick={handleGoogleLogin}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-light)',
                  background: '#ffffff',
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Đăng nhập bảo mật 1 chạm với tài khoản Google"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>Tiếp Tục Với Google (Nhanh 1-Chạm)</span>
              </button>
            </div>

            {/* Social Separator */}
            <div className="auth-separator" style={{ margin: '0 0 16px 0' }}>
              <span>hoặc chọn phương thức xác thực</span>
            </div>

            {/* Dual Method Tabs: Phương án 2 (OTP) & Phương án 1 (Password) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              padding: '4px',
              background: '#F1F5F9',
              borderRadius: '10px',
              marginBottom: '18px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: authMethod === 'otp' ? 700 : 500,
                  background: authMethod === 'otp' ? '#ffffff' : 'transparent',
                  color: authMethod === 'otp' ? 'var(--primary)' : '#64748B',
                  boxShadow: authMethod === 'otp' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <KeyRound size={15} />
                <span>Mã OTP Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('password');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: authMethod === 'password' ? 700 : 500,
                  background: authMethod === 'password' ? '#ffffff' : 'transparent',
                  color: authMethod === 'password' ? 'var(--primary)' : '#64748B',
                  boxShadow: authMethod === 'password' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Lock size={15} />
                <span>Mật Khẩu</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="auth-error-msg" style={{ marginBottom: '14px', fontSize: '0.86rem', padding: '10px 14px', background: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
                <HelpCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Info Message */}
            {infoMsg && (
              <div style={{
                marginBottom: '14px',
                fontSize: '0.85rem',
                padding: '10px 14px',
                background: '#ECFDF5',
                borderRadius: '8px',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* Main Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="auth-field">
                <label htmlFor="login-email">Địa Chỉ Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    className={`auth-input ${errorMsg ? 'has-error' : ''}`}
                    placeholder="VD: ban@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    required
                  />
                </div>
              </div>

              {/* METHOD 1: OTP VERIFICATION */}
              {authMethod === 'otp' && (
                <div className="auth-field" style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="login-otp" style={{ margin: 0 }}>Mã Xác Thực OTP (6 số)</label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || otpCountdown > 0 || !email.trim()}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: (otpCountdown > 0 || !email.trim()) ? '#94A3B8' : 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: (otpCountdown > 0 || !email.trim()) ? 'not-allowed' : 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Đang gửi mã...</span>
                        </>
                      ) : otpCountdown > 0 ? (
                        <span>Gửi lại sau ({otpCountdown}s)</span>
                      ) : (
                        <>
                          <RotateCw size={12} />
                          <span>{otpSent ? 'Gửi lại mã OTP' : 'Nhận mã xác thực OTP'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <KeyRound size={18} />
                    </span>
                    <input
                      id="login-otp"
                      type="text"
                      maxLength={6}
                      className="auth-input"
                      placeholder={otpSent ? "Nhập mã 6 số (VD: 123456)" : "Bấm 'Nhận mã xác thực OTP' ở trên"}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setOtp(val);
                        if (errorMsg) setErrorMsg('');
                      }}
                      style={{ letterSpacing: otp ? '4px' : 'normal', fontWeight: otp ? 700 : 400 }}
                    />
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Mã OTP có hiệu lực trong 5 phút. Chỉ người sở hữu hộp thư mới nhận được mã này.
                  </p>
                </div>
              )}

              {/* METHOD 2: PASSWORD VERIFICATION */}
              {authMethod === 'password' && (
                <div className="auth-field" style={{ marginTop: '12px' }}>
                  <label htmlFor="login-password">Mật Khẩu</label>
                  <div className="auth-input-wrap" style={{ position: 'relative' }}>
                    <span className="auth-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Nhập mật khẩu của bạn..."
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748B',
                        padding: '4px'
                      }}
                      aria-label="Hiện mật khẩu"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {email === 'admin@senxinh.vn' && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#059669', fontWeight: 500 }}>
                      ✓ Tài khoản Quản trị viên: Mật khẩu mặc định là <code>admin123</code>
                    </p>
                  )}
                </div>
              )}

              {/* Remember Me */}
              <div className="auth-meta-row" style={{ marginTop: '14px' }}>
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Duy trì đăng nhập trên thiết bị này</span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
                style={{ height: '48px', marginTop: '10px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>
                      {authMethod === 'otp' ? 'Xác Nhận OTP & Đăng Nhập' : 'Đăng Nhập Với Mật Khẩu'}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* New Member Perk Box */}
            <div style={{
              marginTop: '18px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Gift size={18} color="#059669" />
              </div>
              <div style={{ fontSize: '0.82rem', color: '#065F46', lineHeight: 1.45 }}>
                <strong>Quà tặng thành viên mới:</strong> Tự động kích hoạt mã <strong>SENMOI50</strong> (-50.000đ) và cộng <strong>50 điểm Mầm Xanh</strong> ngay sau khi đăng nhập!
              </div>
            </div>

            {/* Guest Checkout Notice */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Bạn chỉ muốn mua hàng nhanh?{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('shop')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Mua hàng không cần tài khoản →
              </button>
            </div>

            {/* Back to Home Link */}
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
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
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
