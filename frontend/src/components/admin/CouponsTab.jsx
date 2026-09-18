import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Tag,
  Copy,
  Check,
  Percent,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Pagination from '../Pagination';

export default function CouponsTab({
  coupons = [],
  couponPage,
  setCouponPage,
  itemsPerPage = 9,
  onOpenAddCoupon,
  onToggleCoupon,
  onDeleteCoupon
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Reset page when searching
  useEffect(() => {
    if (setCouponPage) setCouponPage(1);
  }, [searchQuery, setCouponPage]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    });
  }, [coupons, searchQuery]);

  const couponTotalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const pagedCoupons = filteredCoupons.slice(
    (couponPage - 1) * itemsPerPage,
    couponPage * itemsPerPage
  );

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="admin-tab-content">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrapper" style={{ maxWidth: '380px' }}>
          <Search size={16} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm theo mã voucher hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.84rem' }}>
            <span style={{ background: '#ECFDF5', color: '#047857', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontWeight: 600, border: '1px solid #A7F3D0' }}>
              Đang hoạt động: <strong>{activeCount}</strong>
            </span>
            <span style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
              Tổng cộng: <strong>{coupons.length}</strong> mã
            </span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddCoupon}
            style={{ padding: '9px 18px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Tạo Mã Voucher Mới</span>
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="coupon-cards-grid" style={{ marginBottom: '24px' }}>
        {pagedCoupons.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-light)',
              color: 'var(--text-muted)'
            }}
          >
            <Tag size={44} style={{ opacity: 0.25, marginBottom: '12px' }} />
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {searchQuery ? `Không tìm thấy voucher nào khớp với "${searchQuery}"` : 'Chưa có mã giảm giá nào'}
            </h4>
            <p style={{ fontSize: '0.86rem', marginTop: '6px', color: 'var(--text-light)' }}>
              Hãy nhấn nút "Tạo Mã Voucher Mới" để kích hoạt chương trình ưu đãi cho khách hàng.
            </p>
          </div>
        ) : (
          pagedCoupons.map((c) => (
            <div
              key={c.code}
              className={`admin-coupon-ticket ${!c.isActive ? 'inactive' : ''}`}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div className="coupon-ticket-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '4px 10px',
                        background: c.isActive ? 'rgba(45, 90, 63, 0.08)' : '#F1F5F9',
                        color: c.isActive ? 'var(--primary)' : '#64748B',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '1rem',
                        letterSpacing: '1px',
                        border: `1px solid ${c.isActive ? 'rgba(45, 90, 63, 0.2)' : '#CBD5E1'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{c.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        title="Sao chép mã"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: copiedCode === c.code ? '#059669' : 'inherit'
                        }}
                      >
                        {copiedCode === c.code ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <span
                    className="coupon-discount-badge"
                    style={{
                      background: c.isActive ? 'linear-gradient(135deg, #D97757, #C56343)' : '#94A3B8',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    -{c.discountPercent}%
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 16px', lineHeight: 1.5, minHeight: '40px' }}>
                  {c.description || 'Ưu đãi đặc quyền dành cho khách hàng đặt mua sen đá tại Sen Xinh.'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px dashed #E2E8F0',
                  marginTop: 'auto'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="admin-toggle" title="Bật / tắt hiệu lực mã voucher">
                    <input
                      type="checkbox"
                      checked={Boolean(c.isActive)}
                      onChange={() => onToggleCoupon(c)}
                    />
                    <span className="admin-toggle-slider" />
                  </label>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: c.isActive ? '#059669' : '#94A3B8'
                    }}
                  >
                    {c.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-icon-action delete"
                  onClick={() => onDeleteCoupon(c)}
                  title="Xóa voucher này"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls - Placed cleanly OUTSIDE the grid */}
      <Pagination
        currentPage={couponPage}
        totalPages={couponTotalPages}
        totalItems={filteredCoupons.length}
        onPageChange={setCouponPage}
      />
    </div>
  );
}
