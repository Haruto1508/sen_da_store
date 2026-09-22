import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { CANCEL_REASONS } from './accountConstants';

export default function OrderCancelModal({
  isOpen,
  order,
  onClose,
  cancelReason,
  setCancelReason,
  customReason,
  setCustomReason,
  onConfirmCancel,
  isSubmitting
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div 
      className="modal-backdrop-smooth"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div 
        className="modal-card-smooth"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card-smooth-body">
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <AlertCircle size={22} />
                Xác Nhận Hủy Đơn Hàng
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
                Mã đơn: <strong style={{ color: 'var(--primary)' }}>#{order.orderCode || order.id}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
              aria-label="Đóng"
              style={{
                border: 'none',
                background: '#F1F5F9',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                transition: 'background 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Warning notice */}
          <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 'var(--radius-md, 8px)', padding: '12px 14px', marginBottom: '18px', fontSize: '0.84rem', color: '#991B1B', lineHeight: '1.5' }}>
            ⚠️ <strong>Lưu ý:</strong> Khi bạn xác nhận hủy đơn, số lượng sản phẩm trong đơn sẽ được tự động hoàn trả vào kho của Sen Xinh và đơn hàng sẽ không thể khôi phục lại.
          </div>

          {/* Reasons form */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Vui lòng chọn lý do hủy đơn:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CANCEL_REASONS.map((reason, idx) => (
                <label 
                  key={idx} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    background: cancelReason === reason ? '#F8FAFC' : 'transparent',
                    border: `1px solid ${cancelReason === reason ? 'var(--primary)' : 'var(--border-light, #E2E8F0)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {cancelReason && cancelReason.startsWith('Khác') && (
              <div style={{ marginTop: '12px' }}>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết của bạn tại đây..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--border-light, #E2E8F0)',
                    fontSize: '0.88rem',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              Không Hủy
            </button>
            <button
              type="button"
              onClick={onConfirmCancel}
              disabled={isSubmitting}
              style={{
                padding: '10px 22px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#fff',
                background: '#DC2626',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting && <RefreshCw size={15} className="spin" />}
              <span>{isSubmitting ? 'Đang Hủy...' : 'Xác Nhận Hủy Đơn'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
