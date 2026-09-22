import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw
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
  const isTerminal = order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'RETURNED';

  const { status: liveStatus } = useOrderStatusPolling({
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

  const items = order.items || [];
  const firstItem = items[0];

  const completedDate = order.completedAt ? new Date(order.completedAt) : (order.createdAt ? new Date(order.createdAt) : new Date());
  const diffDays = Math.floor((new Date() - completedDate) / (1000 * 60 * 60 * 24));
  const canReturn = diffDays <= 7 && order.status === 'COMPLETED';

  return (
    <div
      className="account-order-card"
      style={{
        background: isDeleteMode && isSelected ? '#FFFDFD' : '#ffffff',
        border: isDeleteMode && isSelected ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: isDeleteMode && isSelected ? '0 4px 12px rgba(225, 29, 72, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDeleteMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(order.id)}
              style={{ width: '16px', height: '16px', accentColor: '#DC2626', cursor: 'pointer' }}
            />
          )}
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
            #{order.orderCode || order.id}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {order.createdAt ? formatDateTime(order.createdAt) : 'Vừa tạo'}
          </span>
        </div>
        <span
          style={{
            background: statusCfg.bg,
            color: statusCfg.color,
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '6px'
          }}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Main Content (Horizontal Layout) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          {firstItem && (
            <img
              src={firstItem.image || 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=120&q=80'}
              alt={firstItem.productName || firstItem.name}
              style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-light)', flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {firstItem?.productName || firstItem?.name || 'Sản phẩm'}
            </div>
            {items.length > 1 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                và {items.length - 1} sản phẩm khác
              </div>
            )}
          </div>
        </div>
        
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tổng thanh toán</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
            {formatPrice(order.totalAmount)}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
        {isAdmin && (
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="select-filter"
            style={{ padding: '4px 10px', fontSize: '0.75rem', marginRight: 'auto' }}
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

        {/* Thanh toán ngay */}
        {order.status === 'PENDING' && order.paymentMethod !== 'cod' && onNavigatePayment && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigatePayment(order.orderCode || order.id)}
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Thanh Toán</span>
            <ArrowRight size={13} />
          </button>
        )}

        {/* Đã nhận hàng */}
        {!isAdmin && order.status === 'SHIPPING' && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onConfirmReceived(order.id)}
            disabled={isSubmittingReceive}
            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <CheckCircle2 size={13} />
            <span>Đã Nhận Hàng</span>
          </button>
        )}

        {/* Hủy đơn */}
        {!isAdmin && (order.status === 'PENDING' || order.status === 'PAID') && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onOpenCancelModal(order)}
            style={{ padding: '5px 12px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FCA5A5' }}
          >
            Hủy Đơn
          </button>
        )}

        {/* Đổi / Trả hàng */}
        {!isAdmin && canReturn && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onOpenReturnModal && onOpenReturnModal(order)}
            style={{ padding: '5px 12px', fontSize: '0.75rem', color: '#059669', borderColor: '#A7F3D0', background: '#F0FDF4', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={12} />
            <span>Đổi Trả</span>
          </button>
        )}
      </div>
    </div>
  );
}
