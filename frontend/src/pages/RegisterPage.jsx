import React from 'react';
import LoginPage from './LoginPage';

/**
 * RegisterPage - Đồng bộ dùng chung màn hình Đăng Nhập / Đăng Ký 1-Chạm
 * Giúp tối giản ma sát, khách hàng không cần tạo mật khẩu rườm rà.
 */
export default function RegisterPage({ onRegisterSuccess, onNavigate, addToast }) {
  return (
    <LoginPage
      onLoginSuccess={onRegisterSuccess}
      onNavigate={onNavigate}
      addToast={addToast}
    />
  );
}
