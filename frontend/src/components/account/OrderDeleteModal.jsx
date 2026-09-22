import React, { useEffect } from 'react';
import { Trash2, RefreshCw, X } from 'lucide-react';

export default function OrderDeleteModal({
  isOpen,
  selectedCount,
  onClose,
  onConfirmDelete,
  isDeleting
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop-smooth"
      onClick={() => !isDeleting && onClose()}
    >
      <div 
        className="modal-card-smooth"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
              <Trash2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>Xác Nhận Xóa Đơn Hàng</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748B' }}>Thao tác này sẽ xóa vĩnh viễn khỏi lịch sử</p>
            </div>
          </div>
          <button
            onClick={() => !isDeleting && onClose()}
            disabled={isDeleting}
            aria-label="Đóng"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-card-smooth-body" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa <strong>{selectedCount}</strong> đơn hàng đã chọn không?
          </p>
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B' }}>
            💡 <em>Lưu ý:</em> Các đơn hàng bạn đã <strong>bỏ tick</strong> (bỏ qua) sẽ được giữ lại nguyên vẹn trong tài khoản.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{ padding: '9px 18px', fontSize: '0.88rem' }}
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            style={{
              padding: '9px 22px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#fff',
              background: '#DC2626',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isDeleting ? (
              <>
                <RefreshCw size={15} className="spin" />
                <span>Đang Xóa...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Đồng Ý Xóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
