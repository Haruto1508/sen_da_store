import React from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import Pagination from '../Pagination';
import { ORDER_STATUS_LABELS, formatPrice } from './adminConstants';

export default function CustomerOrdersView({
  activeCustomer,
  allOrders,
  orders,
  customerOrderFilter,
  setCustomerOrderFilter,
  custOrderPage,
  setCustOrderPage,
  itemsPerPage = 10,
  getCustomerOrdersCountAndSpent,
  onBack,
  onOpenOrderDetail
}) {
  if (!activeCustomer) return null;

  const { count, totalSpent, orders: custOrders } = getCustomerOrdersCountAndSpent(activeCustomer);
  const completedCount = custOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'SHIPPING' || o.status === 'PAID'
  ).length;

  const filteredCustOrders = custOrders.filter((o) => {
    if (customerOrderFilter === 'all') return true;
    return o.status === customerOrderFilter;
  });

  const custOrderTotalPages = Math.ceil(filteredCustOrders.length / itemsPerPage);
  const pagedCustOrders = filteredCustOrders.slice((custOrderPage - 1) * itemsPerPage, custOrderPage * itemsPerPage);

  return (
    <div className="admin-order-detail-page">
      {/* Navigation Bar */}
      <div className="admin-page-nav-bar">
        <button
          type="button"
          className="btn-back-nav"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Danh Sách Khách Hàng</span>
        </button>
        <div className="admin-breadcrumb">
          <span>Quản Trị Vườn</span>
          <span className="sep">/</span>
          <button type="button" onClick={onBack} className="link-btn">Khách Hàng</button>
          <span className="sep">/</span>
          <span className="active">Lịch Sử Mua Hàng ({activeCustomer.name})</span>
        </div>
      </div>

      {/* Customer Profile Hero Banner */}
      <div className="customer-profile-hero">
        <div className="customer-profile-info">
          <img
            src={
              activeCustomer.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            }
            alt={activeCustomer.name}
            className="customer-profile-avatar"
          />
          <div>
            <h2 className="customer-profile-name">
              {activeCustomer.name}
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.5px'
                }}
              >
                {activeCustomer.role || 'Thành viên thân thiết'}
              </span>
            </h2>
            <div className="customer-profile-meta">
              <span>📧 {activeCustomer.email}</span>
              {activeCustomer.phone && <span>📞 {activeCustomer.phone}</span>}
              {activeCustomer.address && <span>📍 {activeCustomer.address}</span>}
            </div>
          </div>
        </div>

        {/* 4 KPI Stats in Hero */}
        <div className="customer-stats-grid">
          <div className="stat-chip">
            <span className="stat-chip-label">Tổng Đơn Hàng</span>
            <span className="stat-chip-value">{count} đơn</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-label">Giao Thành Công / Đang Giao</span>
            <span className="stat-chip-value" style={{ color: '#A7F3D0' }}>{completedCount} đơn</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-label">Tổng Chi Tiêu Tích Lũy</span>
            <span className="stat-chip-value" style={{ color: '#FDE047' }}>{formatPrice(totalSpent)}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-label">Điểm Thưởng Tích Lũy</span>
            <span className="stat-chip-value" style={{ color: '#FDBA74' }}>🌱 {activeCustomer.points || 0} điểm</span>
          </div>
        </div>
      </div>

      {/* Status Filter Toolbar */}
      <div className="admin-toolbar" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginRight: '6px' }}>
            Lọc theo trạng thái:
          </span>
          {['all', 'PENDING', 'PAID', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              className={`cat-tab ${customerOrderFilter === st ? 'active' : ''}`}
              onClick={() => setCustomerOrderFilter(st)}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              {st === 'all'
                ? `Tất Cả (${custOrders.length})`
                : `${ORDER_STATUS_LABELS[st]?.label || st} (${custOrders.filter(o => o.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredCustOrders.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: '50px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed #E2E8F0',
            textAlign: 'center',
            marginTop: '16px'
          }}
        >
          <ShoppingBag size={44} style={{ opacity: 0.25, marginBottom: '10px', color: 'var(--primary)' }} />
          <h4 style={{ margin: '0 0 6px', color: '#1E293B' }}>Không tìm thấy đơn hàng nào phù hợp</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
            {customerOrderFilter === 'all'
              ? `Khách hàng ${activeCustomer.name} chưa phát sinh giao dịch nào.`
              : `Không có đơn hàng nào có trạng thái "${ORDER_STATUS_LABELS[customerOrderFilter]?.label}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {pagedCustOrders.map((ord) => {
            const statusCfg = ORDER_STATUS_LABELS[ord.status] || ORDER_STATUS_LABELS.PENDING;
            const StatusIcon = statusCfg.icon;

            return (
              <div key={ord.id || ord.orderCode} className="order-card-new-page">
                {/* Header */}
                <div className="order-card-new-page-header">
                  <div className="order-card-new-meta">
                    <span className="order-code-badge">#{ord.orderCode}</span>
                    <span className="order-date-text">
                      📅 {ord.createdAt ? new Date(ord.createdAt).toLocaleString('vi-VN') : 'Vừa tạo'}
                    </span>
                    <span
                      style={{
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <StatusIcon size={13} />
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="order-card-new-actions">
                    <button
                      type="button"
                      className="btn-open-detail"
                      onClick={() => onOpenOrderDetail(ord, 'customer-orders')}
                      title="Mở toàn màn hình trang chi tiết đơn hàng này"
                    >
                      <span>Xem Chi Tiết Đơn Hàng</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Order Summary Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '16px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
                      DANH SÁCH MÓN ({ord.items?.length || 0} sản phẩm):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(ord.items || []).slice(0, 3).map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={
                              it.image ||
                              'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={it.name || it.productName}
                            style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div style={{ fontSize: '0.86rem', flex: 1 }}>
                            <span style={{ fontWeight: 600, color: '#1E293B' }}>{it.name || it.productName}</span>
                            <span style={{ color: '#64748B', marginLeft: '6px' }}>x{it.quantity}</span>
                          </div>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {formatPrice((it.price || 0) * (it.quantity || 1))}
                          </span>
                        </div>
                      ))}
                      {(ord.items?.length || 0) > 3 && (
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                          + và {(ord.items?.length || 0) - 3} sản phẩm khác...
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '6px' }}>
                      📍 <strong>Giao tới:</strong> {ord.shippingAddress || ord.customerAddress || activeCustomer.address || 'Tại cửa hàng'}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      💳 <strong>Phương thức:</strong>{' '}
                      {ord.paymentMethod === 'momo'
                        ? 'Ví MoMo'
                        : ord.paymentMethod === 'vietqr'
                        ? 'VietQR Ngân Hàng'
                        : 'COD (Tiền mặt khi nhận)'}
                    </div>
                    {ord.note && (
                      <div style={{ color: '#D97706' }}>
                        💬 <strong>Ghi chú:</strong> {ord.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Total */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px dashed #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div style={{ fontSize: '0.84rem', color: '#64748B' }}>
                    {ord.subtotal && <span>Tạm tính: {formatPrice(ord.subtotal)} • </span>}
                    {ord.discountAmount > 0 && <span style={{ color: '#059669' }}>Giảm: -{formatPrice(ord.discountAmount)} • </span>}
                    <span>Phí ship: {ord.shippingFee === 0 ? 'Miễn phí' : formatPrice(ord.shippingFee || 30000)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>Tổng tiền:</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                      {formatPrice(ord.totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}

          <Pagination
            currentPage={custOrderPage}
            totalPages={custOrderTotalPages}
            totalItems={filteredCustOrders.length}
            onPageChange={setCustOrderPage}
          />
        </div>
      )}
    </div>
  );
}
