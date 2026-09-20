import React from 'react';
import { Trash2, RefreshCw, X } from 'lucide-react';

export default function OrderDeleteModal({
  isOpen,
  selectedCount,
  onClose,
  onConfirmDelete,
  isDeleting
}) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={() => !isDeleting && onClose()}
    >
      <div 
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-lg, 12px)',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
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
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa <strong>{selectedCount}</strong> đơn hàng đã chọn không?
          </p>
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B' }}>
            💡 <em>Lưu ý:</em> Các đơn hàng bạn đã <strong>bỏ tick</strong> (bỏ qua) sẽ được giữ lại nguyên vẹn trong tài khoản.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
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
