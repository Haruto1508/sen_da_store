import React from 'react';
import {
  ArrowLeft,
  Printer,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Check,
  AlertCircle,
  ShoppingBag,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { ORDER_STATUS_LABELS, formatPrice, formatDateTime } from './adminConstants';

export default function OrderDetailView({
  activeOrder,
  activeCustomer,
  customers = [],
  previousViewMode = 'tabs',
  onBack,
  onOpenCustomerOrders,
  onDetailStatusChange,
  onApproveReturn,
  onRejectReturn
}) {
  if (!activeOrder) return null;

  const statusCfg = ORDER_STATUS_LABELS[activeOrder.status] || ORDER_STATUS_LABELS.PENDING;
  const StatusIcon = statusCfg.icon;

  const stepOrder = ['PENDING', 'PAID', 'SHIPPING', 'COMPLETED'];
  const currentStepIndex = stepOrder.indexOf(activeOrder.status);
  const isCancelled = activeOrder.status === 'CANCELLED';

  const matchedCustomer = customers.find(
    (c) =>
      (activeOrder.customerPhone && c.phone === activeOrder.customerPhone) ||
      (activeOrder.customerEmail && c.email?.toLowerCase() === activeOrder.customerEmail?.toLowerCase()) ||
      (activeOrder.userId && String(c.id) === String(activeOrder.userId))
  );

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
          <span>
            {previousViewMode === 'customer-orders' && activeCustomer
              ? `Quay lại đơn hàng của ${activeCustomer.name}`
              : 'Quay lại Quản Trị'}
          </span>
        </button>
        <div className="admin-breadcrumb">
          <span>Quản Trị Vườn</span>
          <span className="sep">/</span>
          {previousViewMode === 'customer-orders' && activeCustomer ? (
            <>
              <button type="button" onClick={onBack} className="link-btn">Khách Hàng</button>
              <span className="sep">/</span>
              <button type="button" onClick={onBack} className="link-btn">{activeCustomer.name}</button>
              <span className="sep">/</span>
            </>
          ) : (
            <>
              <button type="button" onClick={onBack} className="link-btn">Đơn Hàng</button>
              <span className="sep">/</span>
            </>
          )}
          <span className="active">Chi Tiết Đơn #{activeOrder.orderCode}</span>
        </div>
      </div>

      {/* Order Detail Top Header Card */}
      <div className="order-detail-top-card">
        <div className="order-detail-title-group">
          <div className="order-detail-code-badge">#{activeOrder.orderCode}</div>
          <span style={{ fontSize: '0.88rem', color: '#64748B' }}>
            📅 {activeOrder.createdAt ? formatDateTime(activeOrder.createdAt) : 'Vừa tạo'}
          </span>
          <span
            style={{
              background: statusCfg.bg,
              color: statusCfg.color,
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <StatusIcon size={14} />
            {statusCfg.label}
          </span>
        </div>

        <div className="order-detail-actions">
          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#475569' }}>
            Cập nhật trạng thái:
          </label>
          <select
            value={activeOrder.status}
            onChange={(e) => onDetailStatusChange(e.target.value)}
            className="select-filter"
            style={{ padding: '8px 32px 8px 14px', fontSize: '0.86rem', fontWeight: 600 }}
          >
            <option value="PENDING">Chờ Thanh Toán</option>
            <option value="PAID">Đã Thanh Toán</option>
            <option value="SHIPPING">Đang Giao Hàng</option>
            <option value="COMPLETED">Đã Hoàn Tất</option>
            <option value="RETURN_REQUESTED">Yêu Cầu Hoàn Trả</option>
            <option value="RETURNED">Đã Hoàn Trả</option>
            <option value="CANCELLED">Hủy Đơn</option>
          </select>

          <button
            type="button"
            className="btn-print-order"
            onClick={() => window.print()}
            title="In hóa đơn đơn hàng này"
          >
            <Printer size={15} />
            <span>In Hóa Đơn</span>
          </button>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="order-timeline-card">
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          TIẾN TRÌNH XỬ LÝ ĐƠN HÀNG
        </div>
        {isCancelled ? (
          <div style={{ padding: '16px', background: '#FEE2E2', borderRadius: '10px', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>Đơn hàng này đã bị hủy bỏ. Không tiếp tục quy trình xử lý hoặc vận chuyển.</span>
          </div>
        ) : activeOrder.status === 'RETURNED' ? (
          <div style={{ padding: '16px', background: '#F3F4F6', borderRadius: '10px', color: '#4B5563', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} />
            <span>Đơn hàng đã được hoàn trả thành công. Tồn kho sản phẩm và điểm thưởng đã được hoàn tác tự động.</span>
          </div>
        ) : activeOrder.status === 'RETURN_REQUESTED' ? (
          <div style={{ padding: '16px', background: '#FFEDD5', borderRadius: '10px', color: '#C2410C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} />
            <span>Khách hàng đã gửi yêu cầu hoàn trả sản phẩm. Vui lòng kiểm tra lý do và xử lý duyệt hoặc từ chối bên dưới.</span>
          </div>
        ) : (
          <div className="order-timeline-stepper">
            {[
              { key: 'PENDING', label: '1. Tiếp Nhận', desc: 'Chờ thanh toán / xác nhận' },
              { key: 'PAID', label: '2. Đã Thanh Toán', desc: 'Chuẩn bị đóng gói sen đá' },
              { key: 'SHIPPING', label: '3. Đang Vận Chuyển', desc: 'Bàn giao cho shipper' },
              { key: 'COMPLETED', label: '4. Đã Hoàn Tất', desc: 'Khách đã nhận cây an toàn' }
            ].map((step, idx) => {
              const isDone = currentStepIndex > idx || activeOrder.status === 'COMPLETED';
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`timeline-step ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                >
                  <div className="timeline-step-circle">
                    {isDone ? <Check size={18} /> : <span>{idx + 1}</span>}
                  </div>
                  <div className="timeline-step-label">{step.label}</div>
                  <div className="timeline-step-sub">{step.desc}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Order Details Card */}
      {(activeOrder.status === 'RETURN_REQUESTED' || activeOrder.status === 'RETURNED' || activeOrder.returnReason) && (
        <div
          style={{
            background: activeOrder.status === 'RETURN_REQUESTED' ? '#FFF7ED' : activeOrder.status === 'RETURNED' ? '#F3F4F6' : '#EFF6FF',
            border: `1.5px solid ${activeOrder.status === 'RETURN_REQUESTED' ? '#FED7AA' : activeOrder.status === 'RETURNED' ? '#D1D5DB' : '#BFDBFE'}`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: activeOrder.status === 'RETURN_REQUESTED' ? '#EA580C' : '#4B5563',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RotateCcw size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1E293B', fontWeight: 700 }}>
                  {activeOrder.status === 'RETURN_REQUESTED'
                    ? 'Yêu Cầu Đổi / Trả Hàng Từ Khách Hàng'
                    : activeOrder.status === 'RETURNED'
                    ? 'Đơn Hàng Đã Được Hoàn Trả Thành Công'
                    : 'Thông Tin Đổi / Trả Hàng'}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                  {activeOrder.returnRequestedAt
                    ? `Thời gian gửi yêu cầu: ${formatDateTime(activeOrder.returnRequestedAt)}`
                    : 'Chính sách hoàn trả trong 7 ngày'}
                  {activeOrder.returnedAt && ` • Hoàn trả ngày: ${formatDateTime(activeOrder.returnedAt)}`}
                </p>
              </div>
            </div>

            {activeOrder.status === 'RETURN_REQUESTED' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => onApproveReturn && onApproveReturn(activeOrder.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={16} />
                  <span>Duyệt Hoàn Trả & Phục Hồi Kho</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRejectReturn && onRejectReturn(activeOrder.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #FCA5A5',
                    background: '#fff',
                    color: '#DC2626',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Từ Chối Yêu Cầu
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
            <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '4px' }}>Lý Do Hoàn Trả:</div>
              <strong style={{ color: '#0F172A' }}>{activeOrder.returnReason || 'Không có'}</strong>
              {activeOrder.returnNote && (
                <div style={{ marginTop: '6px', color: '#475569', fontSize: '0.84rem' }}>
                  <em>"{activeOrder.returnNote}"</em>
                </div>
              )}
            </div>

            <div style={{ background: '#fff', padding: '14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '4px' }}>Thông Tin Ngân Hàng Hoàn Tiền:</div>
              <strong style={{ color: '#0F172A' }}>{activeOrder.refundBankInfo || 'Chưa cung cấp'}</strong>
            </div>

            {activeOrder.returnRejectReason && (
              <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '8px', border: '1px solid #FEE2E2', gridColumn: '1 / -1' }}>
                <div style={{ color: '#DC2626', fontSize: '0.8rem', marginBottom: '4px', fontWeight: 600 }}>Lý Do Shop Từ Chối Hoàn Trả:</div>
                <span style={{ color: '#991B1B' }}>{activeOrder.returnRejectReason}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="order-detail-grid">
        {/* Left Column (70%): Products Table & Financials */}
        <div>
          <div className="order-detail-section">
            <h3 className="order-detail-section-title">
              <Package size={18} color="var(--primary)" />
              <span>Chi Tiết Sản Phẩm ({activeOrder.items?.length || 0} loại)</span>
            </h3>

            <table className="order-products-table">
              <thead>
                <tr>
                  <th>Sản Phẩm</th>
                  <th style={{ textAlign: 'right' }}>Đơn Giá</th>
                  <th style={{ textAlign: 'center' }}>Số Lượng</th>
                  <th style={{ textAlign: 'right' }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {(activeOrder.items || []).map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={
                            it.image ||
                            'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={it.name || it.productName}
                          className="order-prod-thumb-lg"
                        />
                        <div>
                          <strong style={{ fontSize: '0.94rem', color: '#0F172A', display: 'block' }}>
                            {it.name || it.productName}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                            {it.scientificName || it.category || 'Sen đá nghệ thuật'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                      {formatPrice(it.price)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      x{it.quantity}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                      {formatPrice((it.price || 0) * (it.quantity || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="order-financial-card">
              <div className="financial-row">
                <span>Tạm tính tiền hàng:</span>
                <strong style={{ color: '#0F172A' }}>
                  {formatPrice(
                    activeOrder.subtotal ||
                      (activeOrder.items || []).reduce(
                        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
                        0
                      )
                  )}
                </strong>
              </div>

              {activeOrder.discountAmount > 0 && (
                <div className="financial-row" style={{ color: '#059669' }}>
                  <span>
                    Ưu đãi giảm giá {activeOrder.couponCode ? `(Mã: ${activeOrder.couponCode})` : ''}:
                  </span>
                  <strong>-{formatPrice(activeOrder.discountAmount)}</strong>
                </div>
              )}

              <div className="financial-row">
                <span>Phí vận chuyển:</span>
                <strong style={{ color: '#0F172A' }}>
                  {activeOrder.shippingFee === 0
                    ? 'Miễn phí vận chuyển'
                    : formatPrice(activeOrder.shippingFee || 30000)}
                </strong>
              </div>

              <div className="financial-row total">
                <span>Tổng Thanh Toán:</span>
                <span>{formatPrice(activeOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (30%): Customer, Destination, Payment Cards */}
        <div>
          {/* Customer Card */}
          <div className="order-side-card">
            <h4 className="order-side-card-title">
              <User size={16} color="var(--primary)" />
              <span>Thông Tin Khách Hàng</span>
            </h4>
            <div className="order-side-card-body">
              <div className="order-side-row">
                <strong style={{ fontSize: '0.98rem', color: '#0F172A' }}>
                  {activeOrder.customerName || matchedCustomer?.name || 'Khách Hàng'}
                </strong>
              </div>
              <div className="order-side-row">
                <Mail size={14} className="order-side-row-icon" />
                <span>{activeOrder.customerEmail || matchedCustomer?.email || 'Chưa cung cấp'}</span>
              </div>
              <div className="order-side-row">
                <Phone size={14} className="order-side-row-icon" />
                <span>{activeOrder.customerPhone || matchedCustomer?.phone || 'Chưa cung cấp'}</span>
              </div>
              {matchedCustomer && (
                <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="button"
                    className="btn-customer-view-page"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => onOpenCustomerOrders(matchedCustomer)}
                  >
                    <ShoppingBag size={13} />
                    <span>Xem Tất Cả Đơn Của Khách</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Destination Card */}
          <div className="order-side-card">
            <h4 className="order-side-card-title">
              <MapPin size={16} color="var(--primary)" />
              <span>Địa Chỉ Giao Hàng</span>
            </h4>
            <div className="order-side-card-body">
              <div className="order-side-row">
                <span style={{ fontWeight: 500, color: '#1E293B' }}>
                  {activeOrder.shippingAddress || activeOrder.customerAddress || 'Giao tại vườn'}
                </span>
              </div>
              {activeOrder.note && (
                <div
                  style={{
                    marginTop: '6px',
                    padding: '10px 12px',
                    background: '#FEF3C7',
                    borderRadius: '8px',
                    color: '#92400E',
                    fontSize: '0.82rem',
                    lineHeight: 1.4
                  }}
                >
                  <strong>Ghi chú từ khách:</strong> {activeOrder.note}
                </div>
              )}
            </div>
          </div>

          {/* Payment Card */}
          <div className="order-side-card">
            <h4 className="order-side-card-title">
              <CreditCard size={16} color="var(--primary)" />
              <span>Phương Thức Thanh Toán</span>
            </h4>
            <div className="order-side-card-body">
              <div className="order-side-row">
                <strong style={{ color: '#0F172A' }}>
                  {activeOrder.paymentMethod === 'momo'
                    ? 'Ví Điện Tử MoMo'
                    : activeOrder.paymentMethod === 'vietqr'
                    ? 'Chuyển Khoản VietQR Tự Động'
                    : 'Thanh Toán COD (Tiền mặt khi nhận)'}
                </strong>
              </div>
              <div className="order-side-row">
                <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                  Trạng thái: <strong>{statusCfg.label}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
