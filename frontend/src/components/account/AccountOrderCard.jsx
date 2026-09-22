import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { STATUS_CONFIG, formatPrice, formatDateTime } from './accountConstants';
import { useOrderStatusPolling } from '../../hooks/useOrderStatusPolling';

export default function AccountOrderCard({
  order,
  isDeleteMode,
  isSelected,
  onToggleSelect,
  isAdmin,
  onStatusChange,
  onOpenCancelModal,
  onOpenReturnModal,
  onConfirmReceived,
  isSubmittingReceive,
  onNavigatePayment
}) {
  const [showAllItems, setShowAllItems] = useState(false);
  const isTerminal = order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'RETURNED';

  // Realtime HTTP Polling cho khách hàng theo dõi đơn hàng
  const { status: liveStatus, isPolling } = useOrderStatusPolling({
    orderCode: order.orderCode || String(order.id),
    initialStatus: order.status,
    enabled: !isAdmin && !isTerminal,
    intervalMs: 6000,
    onStatusChange: (newStatus) => {
      if (onStatusChange) {
        onStatusChange(order.id, newStatus);
      }
    }
  });

  const currentStatus = liveStatus || order.status;
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;

  const items = order.items || [];
  const visibleItems = showAllItems || items.length <= 2 ? items : items.slice(0, 2);
  const hasMoreItems = items.length > 2;

  // Tính thời gian bảo hành đổi trả 7 ngày
  const completedDate = order.completedAt ? new Date(order.completedAt) : (order.createdAt ? new Date(order.createdAt) : new Date());
  const diffDays = Math.floor((new Date() - completedDate) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, 7 - diffDays);
  const canReturn = diffDays <= 7 && order.status === 'COMPLETED';

  return (
    <div
      className="account-order-card"
      style={{
        background: isDeleteMode && isSelected ? '#FFFDFD' : '#ffffff',
        border: isDeleteMode && isSelected ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '18px 20px',
        boxShadow: isDeleteMode && isSelected ? '0 4px 12px rgba(225, 29, 72, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0
      }}
    >
      {/* Checkbox bar when in Delete Mode */}
      {isDeleteMode && (
        <div
          className={`order-card-checkbox-bar ${isSelected ? 'selected' : 'unselected'}`}
          onClick={() => onToggleSelect(order.id)}
          style={{ marginBottom: '14px' }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(order.id)}
            style={{ width: '18px', height: '18px', accentColor: '#DC2626', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: isSelected ? '#DC2626' : '#64748B' }}>
            {isSelected ? '✓ Đã chọn xóa đơn này' : '○ Bỏ qua (giữ lại đơn này)'}
          </span>
        </div>
      )}

      {/* 1. Header Line: Order Code, Created Time, Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.96rem' }}>
            #{order.orderCode || order.id}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {order.createdAt ? formatDateTime(order.createdAt) : 'Vừa tạo'}
          </span>
          {isPolling && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', background: '#ECFDF5', color: '#059669', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
              Live
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: statusCfg.bg,
              color: statusCfg.color,
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <StatusIcon size={12} />
            {statusCfg.label}
          </span>

          {isAdmin && (
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="select-filter"
              style={{ padding: '4px 24px 4px 8px', fontSize: '0.78rem' }}
              title="Cập nhật trạng thái đơn (Admin)"
            >
              <option value="PENDING">Chờ Thanh Toán</option>
              <option value="PAID">Đã Thanh Toán</option>
              <option value="SHIPPING">Đang Giao Hàng</option>
              <option value="COMPLETED">Đã Hoàn Tất</option>
              <option value="RETURN_REQUESTED">Chờ Hoàn Trả</option>
              <option value="RETURNED">Đã Hoàn Trả</option>
              <option value="CANCELLED">Hủy Đơn</option>
            </select>
          )}
        </div>
      </div>

      {/* 2. Items List: Clean, Visual Thumbnails */}
      <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visibleItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '4px 0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
              <img
                src={item.image || 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=120&q=80'}
                alt={item.productName || item.name}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '1px solid var(--border-light)',
                  flexShrink: 0
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.productName || item.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  x{item.quantity || 1} • {formatPrice(item.price)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', flexShrink: 0, textAlign: 'right' }}>
              {formatPrice((item.price || 0) * (item.quantity || 1))}
            </div>
          </div>
        ))}

        {hasMoreItems && (
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 0',
              marginTop: '2px'
            }}
          >
            {showAllItems ? (
              <>
                <span>Thu gọn danh sách</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>Xem thêm {items.length - 2} sản phẩm khác</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>

      {/* 3. Shipping & Note Line (Subtle) */}
      <div style={{ padding: '8px 12px', background: 'var(--bg-main)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <MapPin size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <strong>{order.customerName}</strong> ({order.customerPhone}) • {order.shippingAddress || order.customerAddress || 'Địa chỉ mặc định'}
          </span>
        </div>
        {order.note && (
          <div style={{ color: 'var(--accent)', paddingLeft: '19px' }}>
            Ghi chú: {order.note}
          </div>
        )}
      </div>

      {/* Subtle Notice if Cancelled / Returned */}
      {order.status === 'CANCELLED' && (
        <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: '8px', color: '#DC2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>Đơn hàng này đã bị hủy. Cần hỗ trợ xin liên hệ hotline nhà vườn.</span>
        </div>
      )}

      {order.status === 'RETURNED' && (
        <div style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#475569', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <RotateCcw size={14} style={{ flexShrink: 0, color: '#059669' }} />
          <span>Đã hoàn tất hoàn trả & hoàn tiền cho đơn hàng này.</span>
        </div>
      )}

      {/* 4. Footer: Payment method & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px dashed var(--border-light)' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <CreditCard size={13} />
          <span>{
            order.paymentMethod?.toLowerCase() === 'vietqr' ? 'VietQR' :
            order.paymentMethod?.toLowerCase() === 'momo' ? 'MoMo' : 'Tiền mặt (COD)'
          }</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'block' }}>Tổng thanh toán</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
              {formatPrice(order.totalAmount)}
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Thanh toán ngay (nếu PENDING và online) */}
            {order.status === 'PENDING' && order.paymentMethod !== 'cod' && onNavigatePayment && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigatePayment(order.orderCode || order.id)}
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Quét mã QR thanh toán"
              >
                <span>Thanh Toán</span>
                <ArrowRight size={13} />
              </button>
            )}

            {/* Đã nhận hàng (nếu SHIPPING) */}
            {!isAdmin && order.status === 'SHIPPING' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => onConfirmReceived(order.id)}
                disabled={isSubmittingReceive}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCircle2 size={13} />
                <span>Đã Nhận Hàng</span>
              </button>
            )}

            {/* Hủy đơn (nếu PENDING hoặc PAID) */}
            {!isAdmin && (order.status === 'PENDING' || order.status === 'PAID') && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onOpenCancelModal(order)}
                style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                Hủy Đơn
              </button>
            )}

            {/* Đổi / Trả hàng (nếu COMPLETED trong hạn 7 ngày) */}
            {!isAdmin && canReturn && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onOpenReturnModal && onOpenReturnModal(order)}
                style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#059669', borderColor: '#A7F3D0', background: '#F0FDF4', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} />
                <span>Đổi Trả ({remainingDays > 0 ? `Còn ${remainingDays}d` : 'Hôm nay'})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
