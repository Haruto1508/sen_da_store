import React, { useState, useEffect } from 'react';
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
  Gift,
  HelpCircle,
  Loader2,
  KeyRound,
  AlertCircle,
  X
} from 'lucide-react';
import { loginUser, loginWithGoogle, setPassword as apiSetPassword, checkEmailStatus } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigate, addToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Trạng thái tài khoản Google chưa có mật khẩu local
  const [isPasswordNotSet, setIsPasswordNotSet] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState('');

  // Tự động kiểm tra nếu email nhập vào là tài khoản Google chưa có mật khẩu
  const handleCheckEmail = async (emailToCheck) => {
    const cleanEmail = (emailToCheck || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return;
    }

    try {
      const status = await checkEmailStatus(cleanEmail);
      if (status && status.exists && !status.hasPassword) {
        setIsPasswordNotSet(true);
        setErrorMsg('');
        setShowSetPasswordModal(true);
      } else if (status && status.hasPassword) {
        setIsPasswordNotSet(false);
      }
    } catch (e) {
      console.debug('Kiểm tra email thất bại:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập Email hoặc Số điện thoại!');
      return;
    }

    // Nếu người dùng chưa nhập mật khẩu, tự động nhận diện tài khoản Google chưa có mật khẩu
    if (!password) {
      setLoading(true);
      setErrorMsg('');
      try {
        const status = await checkEmailStatus(cleanEmail);
        if (status && status.exists && !status.hasPassword) {
          setIsPasswordNotSet(true);
          setErrorMsg('');
          setShowSetPasswordModal(true);
          return;
        }
      } catch (e) {
        // Fallback
      } finally {
        setLoading(false);
      }

      setErrorMsg('Vui lòng nhập mật khẩu của bạn để tiếp tục!');
      return;
    }

    setErrorMsg('');
    setIsPasswordNotSet(false);
    setLoading(true);

    try {
      const res = await loginUser(cleanEmail, password);
      if (res.success && res.data) {
        if (addToast) {
          addToast(`Chào mừng bạn trở lại, ${res.data.name}!`, 'info');
        }
        if (onLoginSuccess) {
          onLoginSuccess(res.data, rememberMe);
        }
      }
    } catch (err) {
      if (err.code === 'AUTH_008' || (err.message && err.message.includes('chưa thiết lập mật khẩu'))) {
        setIsPasswordNotSet(true);
        setErrorMsg('');
        setShowSetPasswordModal(true);
      } else {
        setIsPasswordNotSet(false);
        setErrorMsg(err.message || 'Đăng nhập không thành công. Hãy thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setSetPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSetPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }

    setSetPasswordLoading(true);
    setSetPasswordError('');

    try {
      const res = await apiSetPassword({
        email: email.trim(),
        password: newPassword
      });

      if (res.success && res.data) {
        if (addToast) {
          addToast('Thiết lập mật khẩu thành công! Chào mừng bạn 🌿', 'info');
        }
        setShowSetPasswordModal(false);
        if (onLoginSuccess) {
          onLoginSuccess(res.data, rememberMe);
        }
      }
    } catch (err) {
      setSetPasswordError(err.message || 'Không thể thiết lập mật khẩu. Vui lòng thử lại!');
    } finally {
      setSetPasswordLoading(false);
    }
  };

  // Khởi tạo Google Identity Services / One Tap khi component mount
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                const res = await loginWithGoogle({ idToken: response.credential });
                if (res.success && res.data) {
                  if (addToast) addToast(`Chào mừng bạn trở lại, ${res.data.name}! 🌿`, 'info');
                  if (onLoginSuccess) onLoginSuccess(res.data, rememberMe);
                }
              } catch (err) {
                setErrorMsg(err.message || 'Lỗi đăng nhập qua Google One Tap.');
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
    if (!clientId || clientId.includes('your-google-client-id')) {
      if (addToast) addToast('Vui lòng cấu hình VITE_GOOGLE_CLIENT_ID trong file .env!', 'error');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      if (addToast) addToast('Đang tải thư viện Google, vui lòng thử lại sau giây lát...', 'warning');
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
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMsg('Đăng nhập Google không thành công: ' + tokenResponse.error);
            }
            return;
          }

          try {
            // Lấy thông tin người dùng từ Google UserInfo API
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await userInfoRes.json();

            // Đồng bộ và đăng nhập vào ứng dụng
            const res = await loginWithGoogle({
              accessToken: tokenResponse.access_token,
              profile
            });

            if (res.success && res.data) {
              if (addToast) {
                addToast(`Đăng nhập Google thành công! Chào mừng ${res.data.name} 🌿`, 'info');
              }
              if (onLoginSuccess) {
                onLoginSuccess(res.data, rememberMe);
              }
            }
          } catch (err) {
            setErrorMsg(err.message || 'Lỗi khi xử lý thông tin tài khoản Google.');
          } finally {
            setLoading(false);
          }
        },
        error_callback: (err) => {
          setLoading(false);
          if (err.type !== 'popup_closed_by_user') {
            setErrorMsg('Cửa sổ Google bị đóng hoặc popup bị chặn bởi trình duyệt.');
          }
        }
      });

      client.requestAccessToken();
    } catch (err) {
      setLoading(false);
      setErrorMsg('Không thể mở cửa sổ đăng nhập Google: ' + err.message);
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

            {/* Google Account Without Password Notice Banner */}
            {isPasswordNotSet && (
              <div style={{
                marginBottom: '18px',
                padding: '14px 16px',
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Sparkles size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#166534', display: 'block' }}>
                      Tài khoản liên kết Google
                    </strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: '#15803D', lineHeight: 1.45 }}>
                      Tài khoản <b>{email}</b> được đăng nhập qua Google và chưa có mật khẩu local. Bạn có thể:
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{
                      padding: '8px 14px',
                      background: '#16A34A',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Đăng nhập nhanh qua Google
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSetPasswordError('');
                      setShowSetPasswordModal(true);
                    }}
                    style={{
                      padding: '8px 14px',
                      background: '#ffffff',
                      color: '#16A34A',
                      border: '1px solid #16A34A',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Thiết lập mật khẩu ngay
                  </button>
                </div>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (isPasswordNotSet) setIsPasswordNotSet(false);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onBlur={() => handleCheckEmail(email)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="auth-field">
                <label htmlFor="login-password">
                  <span>Mật khẩu</span>
                  <a 
                    href="#/forgot-password" 
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
                    placeholder="Nhập mật khẩu của bạn (để trống nếu tạo qua Google)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
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

            {/* Social Separator */}
            <div className="auth-separator">
              <span>hoặc tiếp tục với</span>
            </div>

            {/* Google Sign-in */}
            <div className="auth-social-row">
              <button 
                type="button" 
                className="auth-social-btn"
                disabled={loading}
                onClick={handleGoogleLogin}
                title="Đăng nhập bảo mật với tài khoản Google"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>Đăng nhập với Google</span>
              </button>
            </div>

            {/* Switch to Register */}
            <p className="auth-switch-prompt">
              Chưa có tài khoản Sen Xinh?{' '}
              <a 
                href="#/register" 
                className="auth-link"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('register');
                }}
              >
                Đăng ký thành viên ngay
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

      {/* Modal Thiết Lập Mật Khẩu Cho Tài Khoản Google */}
      {showSetPasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '26px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={22} color="#059669" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>Thiết Lập Mật Khẩu</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tài khoản Google: <b>{email}</b></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetPasswordModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Tạo mật khẩu để có thể đăng nhập bằng cả <b>Email/Mật khẩu</b> và <b>Google</b> trên cùng một tài khoản này.
            </p>

            {setPasswordError && (
              <div style={{ padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#991B1B', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#DC2626" />
                <span>{setPasswordError}</span>
              </div>
            )}

            <form onSubmit={handleSetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="auth-field">
                <label style={{ fontSize: '0.85rem' }}>Mật khẩu mới (tối thiểu 6 ký tự)</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex="-1"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label style={{ fontSize: '0.85rem' }}>Xác nhận mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowSetPasswordModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={setPasswordLoading}
                  style={{
                    flex: 1.5,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {setPasswordLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu Mật Khẩu</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
