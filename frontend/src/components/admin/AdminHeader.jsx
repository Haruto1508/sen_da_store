import React from 'react';
import { Menu, Plus, Store } from 'lucide-react';

export default function AdminHeader({
  viewMode,
  activeTab,
  activeCustomer,
  activeOrder,
  setMobileSidebarOpen,
  onOpenAddProduct,
  onOpenAddCoupon,
  isRealtimeConnected = false
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
          style={{ padding: '8px 16px', fontSize: '0.84rem' }}
        >
          <Plus size={15} />
          <span>Thêm Sen Đá</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onOpenAddCoupon}
          style={{ padding: '8px 16px', fontSize: '0.84rem' }}
        >
          <Plus size={15} />
          <span>Tạo Voucher</span>
        </button>
      </div>
    </header>
  );
}
