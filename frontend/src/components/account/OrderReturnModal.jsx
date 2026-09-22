import React, { useState, useEffect } from 'react';
import { RotateCcw, X, ShieldCheck, CreditCard, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { RETURN_REASONS, formatPrice } from './accountConstants';

export default function OrderReturnModal({
  isOpen,
  order,
  onClose,
  onConfirmReturn,
  isSubmitting,
  onNavigatePolicy
}) {
  const [selectedReason, setSelectedReason] = useState(RETURN_REASONS[0]);
  const [note, setNote] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setValidationError('Vui lòng chọn lý do hoàn trả sản phẩm.');
      return;
    }
    if (!bankInfo.trim()) {
      setValidationError('Vui lòng cung cấp số tài khoản và ngân hàng để nhận tiền hoàn.');
      return;
    }
    setValidationError('');
    onConfirmReturn({
      reason: selectedReason,
      note: note.trim(),
      bankInfo: bankInfo.trim()
    });
  };

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
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-card-smooth-body">
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <RotateCcw size={22} />
                Yêu Cầu Hoàn Trả & Đổi Cây
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
                Đơn hàng: <strong style={{ color: 'var(--primary)' }}>#{order.orderCode || order.id}</strong> • Hoàn tất: {order.completedAt ? new Date(order.completedAt).toLocaleDateString('vi-VN') : (order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong')}
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
                flexShrink: 0
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* 7-day policy banner */}
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1px solid #A7F3D0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#065F46' }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Chính sách đổi trả trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng.</span>
            </div>
            {onNavigatePolicy && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigatePolicy();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                <span>Xem chính sách</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>

          {validationError && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Reason Selection */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
                1. Lý do hoàn trả sản phẩm: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="select-filter"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  background: '#fff'
                }}
              >
                {RETURN_REASONS.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Detailed Note */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
                2. Mô tả chi tiết vấn đề gặp phải:
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Cây bị gãy 3 nhánh lá phía dưới, rễ bị ướt sũng khi mở thùng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Refund Bank Info */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>
                3. Thông tin nhận tiền hoàn: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Ví dụ: MBBank - 0123456789 - NGUYEN VAN A"
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
                <CreditCard size={18} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Số tiền dự kiến hoàn trả: <strong>{formatPrice(order.totalAmount)}</strong> (100% giá trị đơn hàng)
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  padding: '10px 22px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: '#059669',
                  borderColor: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="spin-animation" />
                    <span>Đang Gửi Yêu Cầu...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    <span>Gửi Yêu Cầu Hoàn Trả</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
