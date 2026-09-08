import React, { useState } from 'react';
import {
  Shield,
  Lock,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { loginUser } from '../../services/api';

export default function AdminGatekeeper({
  user,
  onLoginAsAdmin,
  onNavigateHome,
  addToast
}) {
  const [adminEmail, setAdminEmail] = useState('admin@senxinh.vn');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);

  const handleAdminGateLogin = async (e) => {
    if (e) e.preventDefault();
    setGateError('');
    setGateLoading(true);
    try {
      const res = await loginUser(adminEmail, adminPassword);
      if (res && res.data) {
        if (
          res.data.role?.toLowerCase().includes('admin') ||
          res.data.email === 'admin@senxinh.vn'
        ) {
          if (onLoginAsAdmin) onLoginAsAdmin(res.data, true);
          if (addToast) addToast(`Chào mừng Quản trị viên ${res.data.name}!`, 'success');
        } else {
          setGateError('Tài khoản này không có quyền Quản Trị Viên (Admin)!');
        }
      }
    } catch (err) {
      setGateError(err.message || 'Đăng nhập quản trị thất bại');
    } finally {
      setGateLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setAdminEmail('admin@senxinh.vn');
    setAdminPassword('admin123');
    setGateLoading(true);
    try {
      const res = await loginUser('admin@senxinh.vn', 'admin123');
      if (res && res.data) {
        if (onLoginAsAdmin) onLoginAsAdmin(res.data, true);
        if (addToast) addToast('Đăng nhập Quản Trị Viên thành công!', 'success');
      }
    } catch (err) {
      setGateError(err.message || 'Lỗi đăng nhập nhanh');
    } finally {
      setGateLoading(false);
    }
  };

  return (
    <div className="admin-gate-wrapper">
      <div className="admin-gate-card">
        <div className="admin-gate-badge">
          <Shield size={13} />
          CỔNG BẢO MẬT NỘI BỘ
        </div>

        <h2 className="admin-gate-title">
          <Lock size={26} color="#0F172A" />
          Quản Trị Nhà Vườn
        </h2>
        <p className="admin-gate-desc">
          Khu vực dành riêng cho Quản Trị Viên (Admin) Sen Xinh Garden. Vui lòng đăng nhập với tài khoản được ủy quyền.
        </p>

        {user && (
          <div className="admin-gate-current-user">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Đang đăng nhập:</strong> {user.name} ({user.email})<br />
              <span style={{ fontSize: '0.78rem' }}>
                Vai trò hiện tại: <em>{user.role || 'CUSTOMER'}</em>. Bạn không có quyền truy cập trang quản trị.
              </span>
            </div>
          </div>
        )}

        {gateError && (
          <div className="admin-gate-error">
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{gateError}</span>
          </div>
        )}

        <form className="admin-gate-form" onSubmit={handleAdminGateLogin}>
          <div className="admin-field">
            <label>Tài Khoản Quản Trị (Email)</label>
            <input
              type="email"
              placeholder="admin@senxinh.vn"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-field">
            <label>Mật Khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            disabled={gateLoading}
          >
            {gateLoading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị Viên'}
          </button>
        </form>

        <div className="admin-gate-divider">
          <span>HOẶC TRẢI NGHIỆM NHANH</span>
        </div>

        <button
          type="button"
          className="admin-btn-demo"
          onClick={handleQuickAdminLogin}
          disabled={gateLoading}
        >
          <Sparkles size={16} />
          Đăng Nhập Thử Nghiệm (Admin Demo)
        </button>

        <div className="admin-gate-footer">
          <button
            type="button"
            className="admin-btn-back"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={15} />
            Quay lại cửa hàng Sen Xinh
          </button>
        </div>
      </div>
    </div>
  );
}
