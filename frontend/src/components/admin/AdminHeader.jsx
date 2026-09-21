import React from 'react';
import { Menu, Plus, LogOut, KeyRound } from 'lucide-react';

export default function AdminHeader({
  viewMode,
  activeTab,
  setActiveTab,
  activeCustomer,
  activeOrder,
  setMobileSidebarOpen,
  onOpenAddProduct,
  onOpenAddCoupon,
  isRealtimeConnected = false,
  user,
  onLogout
}) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={() => setMobileSidebarOpen(true)}
          title="Mở menu điều hướng quản trị"
        >
          <Menu size={20} />
        </button>

        <div className="admin-topbar-title-group">
          <div className="admin-topbar-breadcrumb">
            <span>Quản Trị Vườn</span>
            <span className="sep">/</span>
            <span className="cur">
              {viewMode === 'customer-orders' && `Khách Hàng / ${activeCustomer?.name || ''}`}
              {viewMode === 'order-detail' && `Đơn Hàng / #${activeOrder?.orderCode || ''}`}
              {viewMode === 'tabs' && (
                <>
                  {activeTab === 'orders' && 'Đơn Hàng Cần Xử Lý'}
                  {activeTab === 'delivered' && 'Đơn Hàng Đã Giao'}
                  {activeTab === 'products' && 'Kho Sen Đá & Tồn Kho'}
                  {activeTab === 'coupons' && 'Mã Giảm Giá & Voucher'}
                  {activeTab === 'customers' && 'Khách Hàng & Phân Quyền'}
                  {activeTab === 'shipping' && 'Cấu Hình Phí Vận Chuyển'}
                  {activeTab === 'admin-accounts' && 'Tài Khoản Quản Trị'}
                </>
              )}
            </span>
          </div>
          <h1 className="admin-topbar-page-title">
            {viewMode === 'customer-orders' && `Lịch Sử Mua Hàng: ${activeCustomer?.name || 'Khách Hàng'}`}
            {viewMode === 'order-detail' && `Chi Tiết Đơn Hàng #${activeOrder?.orderCode || ''}`}
            {viewMode === 'tabs' && (
              <>
                {activeTab === 'orders' && 'Đơn Hàng Cần Xử Lý'}
                {activeTab === 'delivered' && 'Đơn Hàng Đã Giao'}
                {activeTab === 'products' && 'Kho Sen Đá & Tồn Kho'}
                {activeTab === 'coupons' && 'Mã Giảm Giá & Voucher'}
                {activeTab === 'customers' && 'Khách Hàng & Phân Quyền'}
                {activeTab === 'shipping' && 'Cấu Hình Phí Vận Chuyển'}
                {activeTab === 'admin-accounts' && 'Tài Khoản Quản Trị'}
              </>
            )}
          </h1>
        </div>
      </div>

      <div className="admin-topbar-actions">
        {isRealtimeConnected ? (
          <div
            className="admin-realtime-badge"
            title="Đang kết nối luồng sự kiện đơn hàng thời gian thực (Server-Sent Events)"
          >
            <span className="admin-realtime-dot" />
            <span className="admin-realtime-label">Realtime Live</span>
          </div>
        ) : null}

        <button
          type="button"
          className="btn-primary admin-header-action-btn"
          onClick={onOpenAddProduct}
          title="Thêm cây sen đá mới vào kho"
        >
          <Plus size={15} />
          <span className="admin-btn-text">Thêm Sen Đá</span>
        </button>

        <button
          type="button"
          className="btn-secondary admin-header-action-btn"
          onClick={onOpenAddCoupon}
          title="Tạo mã giảm giá / voucher khuyến mãi mới"
        >
          <Plus size={15} />
          <span className="admin-btn-text">Tạo Voucher</span>
        </button>

        {/* Cụm Thông Tin Admin & Đăng Xuất */}
        <div className="admin-topbar-user-section">
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('admin-accounts')}
            title="Xem hồ sơ & Đổi mật khẩu tài khoản Quản trị"
            className={`admin-header-profile-btn ${activeTab === 'admin-accounts' ? 'active' : ''}`}
          >
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt="Admin"
              className="admin-header-avatar"
            />
            <span className="admin-header-username">
              {user?.name || 'Admin'}
            </span>
            <KeyRound size={13} color="#2563eb" title="Đổi mật khẩu" />
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Đăng xuất khỏi tài khoản Quản trị"
              className="admin-header-logout-btn"
            >
              <LogOut size={14} />
              <span className="admin-btn-text">Đăng Xuất</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
