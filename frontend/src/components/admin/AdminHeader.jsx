import React from 'react';
import { Menu, Plus } from 'lucide-react';

export default function AdminHeader({
  viewMode,
  activeTab,
  activeCustomer,
  activeOrder,
  setMobileSidebarOpen,
  onOpenAddProduct,
  onOpenAddCoupon
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
                  {activeTab === 'orders' && 'Đơn Hàng & Vận Chuyển'}
                  {activeTab === 'products' && 'Kho Sen Đá & Tồn Kho'}
                  {activeTab === 'coupons' && 'Mã Ưu Đãi & Voucher'}
                  {activeTab === 'customers' && 'Khách Hàng & Phân Quyền'}
                </>
              )}
            </span>
          </div>
          <h1 className="admin-topbar-page-title">
            {viewMode === 'customer-orders' && `Lịch Sử Mua Hàng: ${activeCustomer?.name || 'Khách Hàng'}`}
            {viewMode === 'order-detail' && `Chi Tiết Đơn Hàng #${activeOrder?.orderCode || ''}`}
            {viewMode === 'tabs' && (
              <>
                {activeTab === 'orders' && 'Quản Lý Đơn Hàng & Vận Chuyển'}
                {activeTab === 'products' && 'Kho Sen Đá & Quản Lý Tồn Kho'}
                {activeTab === 'coupons' && 'Mã Ưu Đãi & Voucher Giảm Giá'}
                {activeTab === 'customers' && 'Khách Hàng & Phân Quyền Quản Trị'}
              </>
            )}
          </h1>
        </div>
      </div>

      <div className="admin-topbar-actions">
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
