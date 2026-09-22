import React from 'react';
import { User, Package, History, Heart, ShoppingBag, LogOut } from 'lucide-react';

export default function AccountSidebar({
  user,
  currentUser,
  formData,
  activeTab,
  setActiveTab,
  setIsEditing,
  cartCount,
  wishlistCount,
  completedOrdersCount = 0,
  onLogout,
  onNavigateCart
}) {
  return (
    <aside className="account-sidebar">
      <div className="profile-card">
        <h2 className="profile-name">{formData.name || 'Người dùng'}</h2>
        <p className="profile-email">{formData.email || 'Chưa có email'}</p>

        <div className="profile-membership-pill">
          <span>{currentUser?.role || (user ? 'Thành Viên Mới' : 'Khách Ghé Thăm')}</span>
        </div>

        {/* Interactive Quick Stats */}
        <div className="profile-stats">
          <div 
            className={`profile-stat-item ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
            style={{ cursor: 'pointer' }}
            title="Nhấn để xem giỏ hàng"
          >
            <strong>{cartCount}</strong>
            <span>Giỏ hàng</span>
          </div>

          <div className="profile-stat-divider" />

          <div 
            className={`profile-stat-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
            style={{ cursor: 'pointer' }}
            title="Nhấn để xem mục yêu thích"
          >
            <strong>{wishlistCount}</strong>
            <span>Yêu thích</span>
          </div>

          <div className="profile-stat-divider" />

          <div className="profile-stat-item" title="Điểm tích lũy thành viên">
            <strong>{currentUser?.points ?? 0}</strong>
            <span>Điểm Sen</span>
          </div>
        </div>

        {!user && (
          <div style={{ padding: '12px 14px', background: '#FEF3C7', borderRadius: 'var(--radius-md)', margin: '14px 0', border: '1px solid #FDE68A', textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: '#92400E', marginBottom: '8px' }}>
              Đăng nhập để tích Điểm Sen và quản lý đơn hàng!
            </p>
            <button 
              className="btn-primary" 
              onClick={onLogout}
              style={{ padding: '6px 14px', fontSize: '0.82rem', width: '100%' }}
            >
              Đăng Nhập Ngay
            </button>
          </div>
        )}

        {/* Sidebar Navigation Links */}
        <div className="profile-nav-list">
          <button 
            className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              if (setIsEditing) setIsEditing(false);
            }}
          >
            <User size={18} />
            <span>Thông Tin Cá Nhân</span>
          </button>

          <button 
            className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} />
            <span>Xem Đơn Hàng</span>
          </button>

          <button 
            className={`profile-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            <span>Lịch Sử Mua Hàng</span>
            {completedOrdersCount > 0 && (
              <span className="profile-nav-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                {completedOrdersCount}
              </span>
            )}
          </button>

          <button 
            className={`profile-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={18} />
            <span>Mục Yêu Thích</span>
            {wishlistCount > 0 && (
              <span className="profile-nav-badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                {wishlistCount}
              </span>
            )}
          </button>

          <button 
            className={`profile-nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingBag size={18} />
            <span>Xem Giỏ Hàng</span>
            {cartCount > 0 && (
              <span className="profile-nav-badge">
                {cartCount}
              </span>
            )}
          </button>

          <button 
            className="profile-nav-btn logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Đăng Xuất Tài Khoản</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
