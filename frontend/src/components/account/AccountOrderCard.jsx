import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { STATUS_CONFIG, DELIVERY_STEPS, formatPrice } from './accountConstants';

export default function AccountOrderCard({
  order,
  isDeleteMode,
  isSelected,
  onToggleSelect,
  isAdmin,
  onStatusChange,
  onOpenCancelModal,
  onConfirmReceived,
  isSubmittingReceive,
  onNavigatePayment
}) {
  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;
  const currentStep = statusCfg.step;

  return (
    <div 
      style={{
        background: isDeleteMode && isSelected ? '#FFFDFD' : '#fff',
        border: isDeleteMode && isSelected ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: isDeleteMode && isSelected ? '0 4px 12px rgba(225, 29, 72, 0.08)' : 'var(--shadow-sm)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Checkbox bar when in Delete Mode */}
      {isDeleteMode && (
        <div 
          className={`order-card-checkbox-bar ${isSelected ? 'selected' : 'unselected'}`}
          onClick={() => onToggleSelect(order.id)}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(order.id)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#DC2626',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? '#DC2626' : '#64748B' }}>
            {isSelected ? '✓ Đã chọn xóa đơn này' : '○ Bỏ qua (giữ lại đơn này không xóa)'}
          </span>
        </div>
      )}

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
              #{order.orderCode || order.id}
            </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
              • {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Vừa tạo'}
            </span>
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '4px' }}>
            Người nhận: {order.customerName} - 📞 {order.customerPhone}
          </div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            📍 Giao đến: {order.shippingAddress || order.customerAddress || 'Địa chỉ mặc định'}
          </div>
          {order.note && (
            <div style={{ fontSize: '0.84rem', color: 'var(--accent)', marginTop: '2px' }}>
              💬 Ghi chú: {order.note}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span 
            style={{
              background: statusCfg.bg,
              color: statusCfg.color,
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <StatusIcon size={14} />
            {statusCfg.label}
          </span>

          {isAdmin ? (
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="select-filter"
              style={{ padding: '6px 30px 6px 12px', fontSize: '0.82rem' }}
              title="Cập nhật trạng thái đơn hàng (Admin)"
            >
              <option value="PENDING">Chờ Thanh Toán</option>
              <option value="PAID">Đã Thanh Toán</option>
              <option value="SHIPPING">Đang Giao Hàng</option>
              <option value="COMPLETED">Đã Hoàn Tất</option>
              <option value="CANCELLED">Hủy Đơn</option>
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {order.status === 'SHIPPING' && (
                <button
                  className="btn-primary"
                  onClick={() => onConfirmReceived(order.id)}
                  disabled={isSubmittingReceive}
                  style={{
                    padding: '7px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: '#059669',
                    borderColor: '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Xác nhận bạn đã nhận được hàng và tích lũy Điểm Sen"
                >
                  <CheckCircle2 size={15} />
                  <span>Đã Nhận Được Hàng</span>
                </button>
              )}

              {(order.status === 'PENDING' || order.status === 'PAID') && (
                <button
                  className="btn-secondary"
                  onClick={() => onOpenCancelModal(order)}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                  title="Hủy đơn hàng này"
                >
                  Hủy Đơn
                </button>
              )}

              {order.status === 'COMPLETED' && (
                <span style={{
                  fontSize: '0.8rem',
                  color: '#059669',
                  fontWeight: 600,
                  background: '#DCFCE7',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <CheckCircle2 size={13} /> Đã Giao Thành Công
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Progress Bar */}
      {order.status !== 'CANCELLED' ? (
        <div style={{ background: 'var(--bg-alt)', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
            🚚 Tiến trình vận chuyển & giao hàng:
          </div>

          <div className="delivery-tracker">
            {DELIVERY_STEPS.map((st) => {
              const isCompleted = currentStep > st.step;
              const isActive = currentStep === st.step;

              return (
                <div 
                  key={st.step} 
                  className={`delivery-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  <div className="delivery-step-dot">
                    {isCompleted ? '✓' : st.step}
                  </div>
                  <span className="delivery-step-label">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ background: '#FEF2F2', border: '1px dashed #FCA5A5', color: '#DC2626', padding: '12px 18px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.88rem' }}>
          ⚠️ Đơn hàng này đã bị hủy. Nếu có bất kỳ thắc mắc nào, quý khách vui lòng liên hệ hotline hỗ trợ.
        </div>
      )}

      {/* Items and Total */}
      <div style={{ background: 'var(--bg-main)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sản phẩm đã chọn:</span>
          <span style={{ fontWeight: 500 }}>
            {(order.items || []).map(it => `${it.productName || it.name} (x${it.quantity})`).join(' • ')}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, paddingTop: '10px', borderTop: '1px dashed var(--border-light)', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Phương thức: <strong>{
              order.paymentMethod?.toLowerCase() === 'vietqr' ? 'Chuyển khoản VietQR' :
              order.paymentMethod?.toLowerCase() === 'momo' ? 'Ví điện tử MoMo' :
              'Tiền mặt khi nhận (COD)'
            }</strong>
          </span>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {order.status === 'PENDING' && order.paymentMethod !== 'cod' && onNavigatePayment && (
              <button
                className="btn-primary"
                onClick={() => onNavigatePayment(order.orderCode || order.id)}
                style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Quét mã QR để hoàn tất thanh toán"
              >
                <span>Thanh Toán Ngay</span>
                <ArrowRight size={14} />
              </button>
            )}
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', display: 'block' }}>Tổng thanh toán</span>
              <span style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
