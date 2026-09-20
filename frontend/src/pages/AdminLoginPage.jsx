import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  LogIn,
  Loader2,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { loginUser } from '../services/api';
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
  const [demoLoading, setDemoLoading] = useState(false);
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

  // Đăng nhập nhanh với tài khoản Demo Quản Trị Viên (admin@senxinh.vn / admin123)
  const handleQuickDemoLogin = async () => {
    setAdminEmail('admin@senxinh.vn');
    setAdminPassword('admin123');
    setErrorMessage('');
    setDemoLoading(true);

    try {
      const res = await loginUser('admin@senxinh.vn', 'admin123');
      if (res && res.data) {
        if (onLoginAsAdmin) {
          onLoginAsAdmin(res.data, true);
        }
        if (addToast) {
          addToast('Đăng nhập Quản Trị Viên Demo thành công!', 'success');
        }
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi đăng nhập bằng tài khoản Demo');
    } finally {
      setDemoLoading(false);
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
          <div className="admin-login-badge-wrap">
            <span className="admin-login-badge">
              <span className="admin-login-badge-dot" />
              CỔNG QUẢN TRỊ BẢO MẬT
            </span>
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
            disabled={loading || demoLoading}
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
          <span>HOẶC TRẢI NGHIỆM NHANH</span>
        </div>

        {/* Quick Demo Access Button */}
        <button
          type="button"
          className="admin-login-demo-btn"
          onClick={handleQuickDemoLogin}
          disabled={loading || demoLoading}
        >
          {demoLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang đăng nhập demo...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Đăng Nhập Nhanh (Admin Demo: admin123)</span>
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
