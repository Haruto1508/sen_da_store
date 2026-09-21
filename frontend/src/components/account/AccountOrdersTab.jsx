import React from 'react';
import { Package, RefreshCw, Trash2, X, ArrowRight } from 'lucide-react';
import AccountOrderCard from './AccountOrderCard';
import Pagination from '../Pagination';

export default function AccountOrdersTab({
  user,
  orders,
  stats,
  filterStatus,
  setFilterStatus,
  ordersLoading,
  pagedOrders,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  isDeleteMode,
  selectedOrderIds,
  handleToggleDeleteMode,
  handleSelectAll,
  handleDeselectAll,
  handleToggleSelectOrder,
  setIsConfirmDeleteModalOpen,
  isDeletingOrders,
  isAdmin,
  handleStatusChange,
  handleOpenCancelModal,
  handleOpenReturnModal,
  handleConfirmReceived,
  isSubmittingReceive,
  onNavigateShop,
  onNavigatePayment,
  onLogout
}) {
  if (!user) {
    return (
      <div className="account-tab-content">
        <div className="account-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Package size={48} style={{ opacity: 0.35, color: 'var(--primary)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Tra Cứu Lịch Sử Đơn Hàng</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px' }}>
            Vui lòng đăng nhập để theo dõi trạng thái vận chuyển, kiểm tra lộ trình giao hàng và hóa đơn các chậu cây của bạn.
          </p>
          <button className="btn-primary" onClick={onLogout} style={{ padding: '12px 28px' }}>
            <span>Đăng Nhập Ngay</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-tab-content">
      <div className="account-card">
        {/* Header with Title and Delete Mode Trigger */}
        <div className="account-card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Danh Sách Đơn Hàng & Lịch Sử Giao Hàng</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              Theo dõi trạng thái giao hàng, kiểm tra lộ trình vận chuyển và thông tin thanh toán
            </p>
          </div>

          {orders.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className={`btn-secondary ${isDeleteMode ? 'active' : ''}`}
                onClick={handleToggleDeleteMode}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: isDeleteMode ? '#DC2626' : 'var(--text-main)',
                  borderColor: isDeleteMode ? '#FCA5A5' : 'var(--border-color)',
                  background: isDeleteMode ? '#FEF2F2' : '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title={isDeleteMode ? 'Hủy chế độ xóa' : 'Bật chế độ chọn để xóa các đơn hàng'}
              >
                <Trash2 size={15} color={isDeleteMode ? '#DC2626' : 'currentColor'} />
                <span>{isDeleteMode ? 'Hủy Chế Độ Xóa' : 'Xóa Tất Cả / Chọn Xóa'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bulk Delete Toolbar when active */}
        {isDeleteMode && (
          <div className="order-delete-toolbar">
            <div className="order-delete-toolbar-info">
              <Trash2 size={18} color="#E11D48" />
              <span>
                Đã chọn <strong>{selectedOrderIds.length}</strong> / {orders.length} đơn hàng để xóa
              </span>
              <span className="order-delete-toolbar-hint">
                • Nhấp vào ô tick trên từng đơn để bỏ qua (giữ lại) đơn không muốn xóa
              </span>
            </div>

            <div className="order-delete-toolbar-actions">
              <button
                type="button"
                className="btn-toolbar-sub"
                onClick={handleSelectAll}
                title="Chọn tất cả đơn hàng hiện tại"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                className="btn-toolbar-sub"
                onClick={handleDeselectAll}
                title="Bỏ chọn tất cả đơn hàng"
              >
                Bỏ chọn tất cả
              </button>
              <button
                type="button"
                className="btn-toolbar-cancel"
                onClick={handleToggleDeleteMode}
              >
                <X size={14} />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                className="btn-toolbar-delete"
                onClick={() => setIsConfirmDeleteModalOpen(true)}
                disabled={selectedOrderIds.length === 0 || isDeletingOrders}
                title="Xác nhận xóa các đơn hàng đã được tick"
              >
                <Trash2 size={14} />
                <span>Xóa ({selectedOrderIds.length}) Đơn Đã Chọn</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick stats numbers */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Tổng Số Đơn</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{stats.totalOrders}</strong>
            </div>

            <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: '0.8rem', color: '#B45309', display: 'block' }}>Chờ Thanh Toán</span>
              <strong style={{ fontSize: '1.5rem', color: '#D97706' }}>{stats.pendingOrders}</strong>
            </div>

            <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: '0.8rem', color: '#1D4ED8', display: 'block' }}>Đang Xử Lý / Giao</span>
              <strong style={{ fontSize: '1.5rem', color: '#2563EB' }}>{stats.paidOrders}</strong>
            </div>

            <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
              <span style={{ fontSize: '0.8rem', color: '#047857', display: 'block' }}>Hoàn Tất / Đã Giao</span>
              <strong style={{ fontSize: '1.5rem', color: '#059669' }}>{stats.completedOrders}</strong>
            </div>
          </div>
        )}

        {/* Status Tabs Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '6px' }}>
          {[
            { id: 'all', label: 'Tất Cả', count: stats?.totalOrders },
            { id: 'PENDING', label: 'Chờ Thanh Toán', count: stats?.pendingOrders },
            { id: 'PAID', label: 'Đã Thanh Toán', count: stats?.paidOrders },
            { id: 'SHIPPING', label: 'Đang Giao Hàng', count: stats?.shippingOrders },
            { id: 'COMPLETED', label: 'Đã Nhận Hàng (Đã Giao)', count: stats?.completedOrders },
            { id: 'RETURN_REQUESTED', label: 'Chờ Hoàn Trả', count: stats?.returnRequestedOrders },
            { id: 'RETURNED', label: 'Đã Hoàn Trả', count: stats?.returnedOrders },
            { id: 'CANCELLED', label: 'Đã Hủy', count: stats?.cancelledOrders }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`cat-tab ${filterStatus === tab.id ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab.id)}
              style={{ padding: '8px 16px', fontSize: '0.86rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  background: filterStatus === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-alt)',
                  fontSize: '0.75rem',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <RefreshCw size={28} className="spin" style={{ color: 'var(--primary)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử đơn hàng từ máy chủ...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
              <Package size={40} style={{ opacity: 0.35, marginBottom: '12px', color: 'var(--text-muted)' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Chưa có đơn hàng nào trong mục này</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Khám phá ngay bộ sưu tập sen đá tuyệt đẹp để gieo những mầm xanh đầu tiên.
              </p>
              <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                <span>Mua Sắm Ngay</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            pagedOrders.map((order) => (
              <AccountOrderCard
                key={order.id}
                order={order}
                isDeleteMode={isDeleteMode}
                isSelected={selectedOrderIds.includes(order.id)}
                onToggleSelect={handleToggleSelectOrder}
                isAdmin={isAdmin}
                onStatusChange={handleStatusChange}
                onOpenCancelModal={handleOpenCancelModal}
                onOpenReturnModal={handleOpenReturnModal}
                onConfirmReceived={handleConfirmReceived}
                isSubmittingReceive={isSubmittingReceive}
                onNavigatePayment={onNavigatePayment}
              />
            ))
          )}
        </div>

        {/* Phân Trang (Pagination) */}
        {orders.length > itemsPerPage && (
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={orders.length}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
            />
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, orders.length)} trong tổng số {orders.length} đơn hàng
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
