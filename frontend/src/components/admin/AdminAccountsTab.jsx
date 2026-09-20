import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
  RefreshCw,
  X
} from 'lucide-react';
import { createAdminAccount, changeAdminPassword } from '../../services/api';

export default function AdminAccountsTab({
  currentUser,
  customers = [],
  onReloadCustomers,
  onLogout,
  addToast
}) {
  // --- States for Change Password Form ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordMsg, setChangePasswordMsg] = useState({ type: '', text: '' });

  // --- States for Add Admin Modal ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Quản trị viên (Admin)'
  });

  // --- States for Quick Reset Password Modal (target specific admin) ---
  const [resetTargetAdmin, setResetTargetAdmin] = useState(null);
  const [targetNewPassword, setTargetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Danh sách các tài khoản có vai trò Quản Trị Viên
  const adminList = useMemo(() => {
    return customers.filter(
      (c) =>
        (c.role && c.role.toLowerCase().includes('admin')) ||
        c.email === 'admin@senxinh.vn' ||
        c.email === currentUser?.email
    );
  }, [customers, currentUser]);

  // Xử lý đổi mật khẩu của tài khoản hiện tại
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePasswordMsg({ type: '', text: '' });

    if (!newPassword || newPassword.length < 6) {
      setChangePasswordMsg({
        type: 'error',
        text: 'Mật khẩu mới phải có độ dài từ 6 ký tự trở lên!'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordMsg({
        type: 'error',
        text: 'Mật khẩu xác nhận không trùng khớp với mật khẩu mới!'
      });
      return;
    }

    setChangePasswordLoading(true);
    try {
      const emailToChange = currentUser?.email || 'admin@senxinh.vn';
      await changeAdminPassword({
        email: emailToChange,
        oldPassword: oldPassword,
        newPassword: newPassword
      });

      setChangePasswordMsg({
        type: 'success',
        text: 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật an toàn.'
      });
      if (addToast) addToast('Đổi mật khẩu tài khoản Quản trị thành công!', 'success');

      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setChangePasswordMsg({
        type: 'error',
        text: err.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ!'
      });
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Xử lý thêm tài khoản Admin mới
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setAddAdminError('');

    if (!newAdminForm.email?.trim()) {
      setAddAdminError('Vui lòng nhập địa chỉ Email cho Quản trị viên!');
      return;
    }

    if (!newAdminForm.password || newAdminForm.password.length < 6) {
      setAddAdminError('Mật khẩu khởi tạo phải có ít nhất 6 ký tự!');
      return;
    }

    setAddAdminLoading(true);
    try {
      await createAdminAccount({
        name: newAdminForm.name,
        email: newAdminForm.email,
        phone: newAdminForm.phone,
        password: newAdminForm.password,
        role: newAdminForm.role
      });

      if (addToast) {
        addToast(`Tạo tài khoản Quản trị viên [${newAdminForm.email}] thành công!`, 'success');
      }

      // Reset & đóng modal
      setNewAdminForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'Quản trị viên (Admin)'
      });
      setIsAddModalOpen(false);

      if (onReloadCustomers) {
        onReloadCustomers();
      }
    } catch (err) {
      setAddAdminError(err.message || 'Không thể tạo tài khoản quản trị viên.');
    } finally {
      setAddAdminLoading(false);
    }
  };

  // Xử lý reset / đặt lại mật khẩu cho tài khoản admin khác trong danh sách
  const handleResetOtherAdminPassword = async (e) => {
    e.preventDefault();
    if (!resetTargetAdmin) return;
    setResetError('');

    if (!targetNewPassword || targetNewPassword.length < 6) {
      setResetError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setResetLoading(true);
    try {
      await changeAdminPassword({
        email: resetTargetAdmin.email,
        oldPassword: '', // Cấp cao thiết lập lại không bắt buộc mật khẩu cũ
        newPassword: targetNewPassword
      });

      if (addToast) {
        addToast(`Đã đổi mật khẩu cho quản trị viên [${resetTargetAdmin.name || resetTargetAdmin.email}]!`, 'success');
      }

      setResetTargetAdmin(null);
      setTargetNewPassword('');
    } catch (err) {
      setResetError(err.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="admin-tab-content">
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)',
          marginBottom: '24px'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            <ShieldCheck size={16} />
            HỆ THỐNG BẢO MẬT & QUẢN TRỊ NỘI BỘ
          </div>
          <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
            Quản Lý Tài Khoản Quản Trị Viên (Admin)
          </h2>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.9rem', maxWidth: '640px' }}>
            Quản lý quyền hạn đăng nhập, thay đổi mật khẩu bảo mật và cấp quyền tài khoản Quản trị viên mới cho Sen Xinh Garden.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
              cursor: 'pointer'
            }}
          >
            <UserPlus size={17} />
            <span>Thêm Quản Trị Viên</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                color: '#f87171',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Đăng xuất khỏi tài khoản Quản trị viên"
            >
              <LogOut size={16} />
              <span>Đăng Xuất</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: 2 Cột (Thẻ Admin Hiện Tại & Form Đổi Mật Khẩu) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}
      >
        {/* Card 1: Thông tin Admin Hiện Tại */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', marginBottom: '18px' }}>
              <User size={19} color="#2563eb" />
              <span>Tài Khoản Đang Đăng Nhập</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #edf2f7', marginBottom: '18px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={currentUser?.name || 'Admin'}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #3b82f6'
                  }}
                />
                <span
                  title="Đang hoạt động"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid #ffffff'
                  }}
                />
              </div>

              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {currentUser?.name || 'Quản Trị Viên'}
                </h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', padding: '3px 10px', borderRadius: '20px', border: '1px solid #bfdbfe', marginBottom: '4px' }}>
                  <Shield size={12} />
                  {currentUser?.role || 'Quản trị viên (Admin)'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Email: <strong>{currentUser?.email || 'admin@senxinh.vn'}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="#64748b" />
                <span>Hộp thư liên hệ: <strong>{currentUser?.email || 'admin@senxinh.vn'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#64748b" />
                <span>Số điện thoại: <strong>{currentUser?.phone || '0988.123.456 (Chưa cập nhật)'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Trạng thái: <strong style={{ color: '#10b981' }}>Được ủy quyền toàn bộ quyền hạn</strong></span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Đăng Xuất Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Form Đổi Mật Khẩu */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', marginBottom: '8px' }}>
            <KeyRound size={19} color="#10b981" />
            <span>Đổi Mật Khẩu Tài Khoản</span>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: '#64748b' }}>
            Thay đổi mật khẩu định kỳ giúp bảo vệ tài khoản quản trị của bạn khỏi các truy cập trái phép.
          </p>

          {changePasswordMsg.text && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                background: changePasswordMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                color: changePasswordMsg.type === 'error' ? '#dc2626' : '#15803d',
                border: `1px solid ${changePasswordMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
              }}
            >
              {changePasswordMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{changePasswordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Mật khẩu hiện tại */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Mật khẩu hiện tại
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  className="admin-form-input"
                  placeholder="Nhập mật khẩu đang dùng (mặc định: admin123)..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Mật khẩu mới (tối thiểu 6 ký tự)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="admin-form-input"
                  placeholder="Nhập mật khẩu mới an toàn..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                Xác nhận lại mật khẩu mới
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="admin-form-input"
                  placeholder="Gõ lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 38px 9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changePasswordLoading}
              style={{
                marginTop: '6px',
                padding: '10px 16px',
                borderRadius: '9px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: changePasswordLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              {changePasswordLoading ? (
                <>
                  <RefreshCw size={16} className="spin-slow" />
                  <span>Đang cập nhật mật khẩu...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Cập Nhật Mật Khẩu Mới</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Danh Sách Tất Cả Các Tài Khoản Quản Trị Viên */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Danh Sách Quản Trị Viên ({adminList.length})
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Các tài khoản được phân quyền Quản trị viên truy cập vào Bảng điều khiển nhà vườn.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onReloadCustomers}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '0.82rem',
              borderRadius: '8px'
            }}
          >
            <RefreshCw size={14} />
            <span>Làm mới danh sách</span>
          </button>
        </div>

        {/* Bảng Danh Sách Quản Trị Viên */}
        <div className="admin-table-container" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Quản Trị Viên</th>
                <th style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Email Đăng Nhập</th>
                <th style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Số Điện Thoại</th>
                <th style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Phân Quyền</th>
                <th style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>Trạng Thái</th>
                <th style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {adminList.map((adm) => {
                const isCurrent = adm.email === currentUser?.email || (currentUser?.email === 'admin@senxinh.vn' && adm.email === 'admin@senxinh.vn');
                return (
                  <tr
                    key={adm.id || adm.email}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isCurrent ? '#f0fdf4' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={
                            adm.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={adm.name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: isCurrent ? '2px solid #10b981' : '1px solid #e2e8f0'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{adm.name || adm.email?.split('@')[0]}</span>
                            {isCurrent && (
                              <span
                                style={{
                                  background: '#10b981',
                                  color: '#ffffff',
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  fontWeight: 600
                                }}
                              >
                                Bạn
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            ID: #{adm.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.86rem', color: '#334155' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#94a3b8" />
                        <span>{adm.email}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.86rem', color: '#334155' }}>
                      {adm.phone ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#94a3b8" />
                          <span>{adm.phone}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Chưa có</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0'
                        }}
                      >
                        <ShieldCheck size={13} />
                        {adm.role || 'Quản trị viên (Admin)'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: adm.status === 'BANNED' ? '#dc2626' : '#16a34a'
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: adm.status === 'BANNED' ? '#dc2626' : '#16a34a'
                          }}
                        />
                        {adm.status === 'BANNED' ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setResetTargetAdmin(adm);
                          setTargetNewPassword('');
                          setResetError('');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        title="Đặt lại mật khẩu cho quản trị viên này"
                      >
                        <KeyRound size={13} color="#2563eb" />
                        <span>Đổi Mật Khẩu</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thêm Quản Trị Viên Mới */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Thêm Quản Trị Viên</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Cấp quyền truy cập Quản trị nhà vườn</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {addAdminError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.84rem', marginBottom: '14px' }}>
                <AlertCircle size={16} />
                <span>{addAdminError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Họ và tên Quản trị viên <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Quản Trị"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Email đăng nhập <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="admin2@senxinh.vn"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Số điện thoại
                </label>
                <input
                  type="text"
                  placeholder="0988xxxxxx"
                  value={newAdminForm.phone}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Mật khẩu khởi tạo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 38px 9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Vai trò quản trị
                </label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff' }}
                >
                  <option value="Quản trị viên (Admin)">Quản trị viên toàn quyền (Admin)</option>
                  <option value="Quản trị viên vận hành">Quản trị viên vận hành & CSKH</option>
                  <option value="Quản trị viên kho">Quản lý kho sen đá</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={addAdminLoading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: addAdminLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {addAdminLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đặt lại mật khẩu cho tài khoản Admin trong danh sách */}
      {resetTargetAdmin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setResetTargetAdmin(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  Đổi Mật Khẩu Quản Trị Viên
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetTargetAdmin(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: '0.84rem', color: '#64748b' }}>
              Đặt lại mật khẩu cho quản trị viên: <strong>{resetTargetAdmin.name || resetTargetAdmin.email}</strong> ({resetTargetAdmin.email})
            </p>

            {resetError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.84rem', marginBottom: '12px' }}>
                <AlertCircle size={15} />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetOtherAdminPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Mật khẩu mới (tối thiểu 6 ký tự)
                </label>
                <input
                  type="text"
                  placeholder="Nhập mật khẩu mới cho admin này..."
                  value={targetNewPassword}
                  onChange={(e) => setTargetNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setResetTargetAdmin(null)}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.86rem', cursor: 'pointer' }}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: resetLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resetLoading ? 'Đang lưu...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
