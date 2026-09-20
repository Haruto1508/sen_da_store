import React from 'react';
import { Menu, Plus, Store, LogOut, KeyRound, ShieldCheck } from 'lucide-react';

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
          title="Mở menu quản trị"
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
                  {activeTab === 'coupons' && 'Mã Ưu Đãi & Voucher'}
                  {activeTab === 'customers' && 'Khách Hàng & Phân Quyền'}
                  {activeTab === 'shipping' && 'Cấu Hình Phí Vận Chuyển'}
                  {activeTab === 'admin-accounts' && 'Tài Khoản Quản Trị & Mật Khẩu'}
                </>
              )}
            </span>
          </div>
          <h1 className="admin-topbar-page-title">
            {viewMode === 'customer-orders' && `Lịch Sử Mua Hàng: ${activeCustomer?.name || 'Khách Hàng'}`}
            {viewMode === 'order-detail' && `Chi Tiết Đơn Hàng #${activeOrder?.orderCode || ''}`}
            {viewMode === 'tabs' && (
              <>
                {activeTab === 'orders' && 'Quản Lý Đơn Hàng Cần Xử Lý'}
                {activeTab === 'delivered' && 'Đối Soát Đơn Hàng Đã Giao Thành Công'}
                {activeTab === 'products' && 'Kho Sen Đá & Quản Lý Tồn Kho'}
                {activeTab === 'coupons' && 'Mã Ưu Đãi & Voucher Giảm Giá'}
                {activeTab === 'customers' && 'Khách Hàng & Phân Quyền Quản Trị'}
                {activeTab === 'shipping' && 'Cấu Hình Phí Vận Chuyển Từng Tỉnh / Thành Phố'}
                {activeTab === 'admin-accounts' && 'Quản Lý Tài Khoản Quản Trị Viên & Đổi Mật Khẩu'}
              </>
            )}
          </h1>
        </div>
      </div>

      <div className="admin-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isRealtimeConnected ? (
          <div
            className="admin-realtime-badge"
            title="Đang kết nối luồng sự kiện đơn hàng thời gian thực (Server-Sent Events)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: '#ecfdf5',
              border: '1px solid #10b981',
              color: '#065f46',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.2px'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.35)'
              }}
            />
            <span>Realtime Live</span>
          </div>
        ) : null}

        <button
          className="btn-primary"
          onClick={onOpenAddProduct}
          style={{ padding: '8px 14px', fontSize: '0.84rem' }}
        >
          <Plus size={15} />
          <span>Thêm Sen Đá</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onOpenAddCoupon}
          style={{ padding: '8px 14px', fontSize: '0.84rem' }}
        >
          <Plus size={15} />
          <span>Tạo Voucher</span>
        </button>

        {/* Cụm Thông Tin Admin & Đăng Xuất */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '6px',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border-light, #e2e8f0)'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('admin-accounts')}
            title="Xem hồ sơ & Đổi mật khẩu tài khoản Quản trị"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'admin-accounts' ? '#ecfdf5' : '#f8fafc',
              border: activeTab === 'admin-accounts' ? '1px solid #10b981' : '1px solid #cbd5e1',
              padding: '4px 10px 4px 6px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt="Admin"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e293b',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.name || 'Admin'}
            </span>
            <KeyRound size={13} color="#2563eb" title="Đổi mật khẩu" />
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Đăng xuất khỏi tài khoản Quản trị"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <LogOut size={14} />
              <span>Đăng Xuất</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
