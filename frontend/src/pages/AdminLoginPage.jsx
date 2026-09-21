import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  LogIn,
  Loader2,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { loginUser, loginWithGoogle } from '../services/api';
import webLogo from '../assets/logo/web_logo.png';
import './AdminLoginPage.css';

export default function AdminLoginPage({
  user,
  onLoginAsAdmin,
  onLogout,
  addToast,
  onNavigateHome
}) {
  const navigate = useNavigate();

  // Kiểm tra nếu người dùng hiện tại đã là Quản Trị Viên
  const isAdmin = Boolean(
    user &&
    (user.role?.toLowerCase().includes('admin') || user.email === 'admin@senxinh.vn')
  );

  const [adminEmail, setAdminEmail] = useState('admin@senxinh.vn');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Nếu người dùng đã là Admin, tự động điều hướng sang Dashboard /admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Xử lý gửi form đăng nhập
  const handleAdminLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPassword = adminPassword;

    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập Email tài khoản Quản Trị Viên!');
      return;
    }
    if (!cleanPassword) {
      setErrorMessage('Vui lòng nhập Mật khẩu quản trị!');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await loginUser(cleanEmail, cleanPassword);
      if (res && res.data) {
        const userData = res.data;
        const hasAdminRole = Boolean(
          userData.role?.toLowerCase().includes('admin') ||
          userData.email === 'admin@senxinh.vn'
        );

        if (!hasAdminRole) {
          setErrorMessage('Tài khoản này không có quyền truy cập Quản Trị Viên (Admin)! Vui lòng kiểm tra lại.');
          return;
        }

        if (onLoginAsAdmin) {
          onLoginAsAdmin(userData, rememberMe);
        }

        if (addToast) {
          addToast(`Chào mừng Quản trị viên ${userData.name || 'Admin'}! 🌿`, 'success');
        }

        navigate('/admin', { replace: true });
      } else {
        throw new Error('Đăng nhập không thành công. Dữ liệu phản hồi không hợp lệ.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập quản trị:', err);
      const msg = err.message || '';
      if (msg.includes('Mật khẩu') || msg.includes('password')) {
        setErrorMessage('Mật khẩu quản trị không chính xác. Vui lòng kiểm tra lại!');
      } else if (msg.includes('Failed to fetch') || msg.includes('kết nối')) {
        setErrorMessage('Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra cổng API!');
      } else {
        setErrorMessage(msg || 'Đăng nhập Quản trị viên thất bại. Vui lòng thử lại sau!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập Quản Trị Viên bằng tài khoản Google
  const handleGoogleAdminLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isValidClientId = clientId && !clientId.includes('your-google-client-id') && clientId.trim() !== '';

    if (!isValidClientId) {
      console.warn('[Cấu hình] VITE_GOOGLE_CLIENT_ID chưa được thiết lập');
      if (addToast) {
        addToast('Tính năng đăng nhập Google chưa được cấu hình Client ID. Vui lòng đăng nhập bằng Email & Mật khẩu!', 'info');
      }
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      if (addToast) addToast('Đang kết nối thư viện Google OAuth, vui lòng thử lại sau giây lát...', 'info');
      return;
    }

    setGoogleLoading(true);
    setErrorMessage('');

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setGoogleLoading(false);
            console.error('Google OAuth token error:', tokenResponse.error);
            if (tokenResponse.error !== 'popup_closed_by_user') {
              setErrorMessage('Đăng nhập Google không thành công. Vui lòng thử lại!');
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

            if (res && res.data) {
              const userData = res.data;
              const hasAdminRole = Boolean(
                userData.role?.toLowerCase().includes('admin') ||
                userData.email === 'admin@senxinh.vn'
              );

              if (!hasAdminRole) {
                setErrorMessage(`Tài khoản Google (${userData.email}) không có quyền Quản Trị Viên (Admin)!`);
                return;
              }

              if (onLoginAsAdmin) {
                onLoginAsAdmin(userData, rememberMe);
              }

              if (addToast) {
                addToast(`Chào mừng Quản trị viên ${userData.name || 'Admin'}! 🌿`, 'success');
              }

              navigate('/admin', { replace: true });
            } else {
              throw new Error('Đăng nhập không thành công. Dữ liệu phản hồi không hợp lệ.');
            }
          } catch (err) {
            console.error('Lỗi khi xử lý thông tin tài khoản Google:', err);
            setErrorMessage(err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại sau!');
          } finally {
            setGoogleLoading(false);
          }
        },
        error_callback: (err) => {
          setGoogleLoading(false);
          console.error('Google OAuth popup error:', err);
          if (err.type !== 'popup_closed_by_user') {
            setErrorMessage('Cửa sổ đăng nhập Google bị gián đoạn hoặc bị trình duyệt chặn. Vui lòng thử lại!');
          }
        }
      });

      client.requestAccessToken();
    } catch (err) {
      setGoogleLoading(false);
      console.error('Khởi tạo Google OAuth thất bại:', err);
      setErrorMessage('Không thể mở cửa sổ đăng nhập Google. Vui lòng thử lại!');
    }
  };

  // Quay về trang chủ
  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/');
    }
  };

  // Nếu người dùng đã là Admin hợp lệ, chuyển hướng ngay
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="admin-login-viewport">
      {/* Ambient background glow & grid elements */}
      <div className="admin-login-glow-orb-1" />
      <div className="admin-login-glow-orb-2" />
      <div className="admin-login-grid-bg" />

      {/* Main Login Card */}
      <div className="admin-login-card">
        {/* Header with Security Badge */}
        <div className="admin-login-header">
          <div className="admin-login-logo-wrap">
            <a 
              href="/" 
              onClick={(e) => { 
                e.preventDefault(); 
                handleGoHome(); 
              }} 
              title="Quay lại Cửa Hàng Sen Xinh Garden"
              className="admin-login-logo-link"
            >
              <img
                src={webLogo}
                alt="Sen Xinh Garden"
                className="admin-login-logo"
              />
            </a>
          </div>

          <div className="admin-login-icon-box">
            <Shield size={28} />
          </div>

          <h1 className="admin-login-title">Đăng Nhập Quản Trị</h1>
          <p className="admin-login-subtitle">
            Hệ thống quản lý đơn hàng, tồn kho cây & vận hành Sen Xinh Garden
          </p>
        </div>

        {/* Cảnh báo khi người dùng hiện tại đang đăng nhập bằng tài khoản khách */}
        {user && !isAdmin && (
          <div className="admin-login-user-warning">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: '#D97706' }} />
            <div className="admin-login-user-warning-content">
              <div>
                <strong>Tài khoản hiện tại:</strong> {user.name} ({user.email})
              </div>
              <div style={{ marginTop: '2px', fontSize: '0.78rem', color: '#B45309' }}>
                Vai trò: <em>{user.role || 'Khách hàng'}</em>. Tài khoản này không có quyền truy cập trang quản trị.
              </div>
              {onLogout && (
                <button
                  type="button"
                  className="admin-login-switch-btn"
                  onClick={() => {
                    onLogout();
                    if (addToast) addToast('Đã đăng xuất tài khoản khách hàng', 'info');
                  }}
                >
                  <LogOut size={12} />
                  Đăng xuất tài khoản này
                </button>
              )}
            </div>
          </div>
        )}

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="admin-login-error-box">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Đăng Nhập Admin */}
        <form className="admin-login-form" onSubmit={handleAdminLoginSubmit}>
          {/* Email field */}
          <div className="admin-login-field-group">
            <label className="admin-login-label" htmlFor="admin-email">
              Email Quản Trị Viên
            </label>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">
                <Mail size={17} />
              </span>
              <input
                id="admin-email"
                type="email"
                className="admin-login-input"
                placeholder="admin@senxinh.vn"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="admin-login-field-group">
            <label className="admin-login-label" htmlFor="admin-password">
              <span>Mật Khẩu Quản Trị</span>
            </label>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">
                <Lock size={17} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-login-input"
                placeholder="Nhập mật khẩu quản trị viên..."
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#475569' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: '#10B981', cursor: 'pointer' }}
              />
              Ghi nhớ phiên đăng nhập này
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="admin-login-submit-btn"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang xác thực bảo mật...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Đăng Nhập Quản Trị Viên</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="admin-login-divider">
          <span>HOẶC ĐĂNG NHẬP BẰNG</span>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          className="admin-login-google-btn"
          onClick={handleGoogleAdminLogin}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Đang kết nối Google...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Đăng Nhập Quản Trị Bằng Google</span>
            </>
          )}
        </button>

        {/* Footer with Return to Store */}
        <div className="admin-login-footer">
          <button
            type="button"
            className="admin-login-back-btn"
            onClick={handleGoHome}
          >
            <ArrowLeft size={16} />
            <span>Quay lại Cửa Hàng Sen Xinh</span>
          </button>

          <div className="admin-login-security-tag">
            <ShieldCheck size={13} color="#10B981" />
            <span>Mã hóa SSL 256-bit • Phân quyền bảo mật đa tầng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
