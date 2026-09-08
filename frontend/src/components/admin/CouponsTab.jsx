import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Pagination from '../Pagination';

export default function CouponsTab({
  coupons,
  couponPage,
  setCouponPage,
  itemsPerPage = 10,
  onOpenAddCoupon,
  onToggleCoupon,
  onDeleteCoupon
}) {
  const couponTotalPages = Math.ceil(coupons.length / itemsPerPage);
  const pagedCoupons = coupons.slice((couponPage - 1) * itemsPerPage, couponPage * itemsPerPage);

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
            Danh Sách Mã Giảm Giá Đang Có
          </strong>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Khách hàng có thể nhập các mã đang kích hoạt khi xem Giỏ hàng hoặc Thanh toán.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onOpenAddCoupon}
          style={{ padding: '9px 18px', fontSize: '0.88rem' }}
        >
          <Plus size={16} />
          <span>Tạo Mã Voucher Mới</span>
        </button>
      </div>

      <div className="coupon-cards-grid">
        {pagedCoupons.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            Chưa có mã giảm giá nào
          </div>
        ) : (
          pagedCoupons.map((c) => (
            <div key={c.code} className={`admin-coupon-ticket ${!c.isActive ? 'inactive' : ''}`}>
              <div>
                <div className="coupon-ticket-header">
                  <span className="coupon-ticket-code">{c.code}</span>
                  <span className="coupon-discount-badge">-{c.discountPercent}%</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 14px' }}>
                  {c.description || 'Ưu đãi dành cho khách hàng Sen Xinh'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px dashed #E2E8F0'
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
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: c.isActive ? '#059669' : '#94A3B8' }}>
                    {c.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </div>

                <button
                  className="btn-icon-action delete"
                  onClick={() => onDeleteCoupon(c)}
                  title="Xóa voucher này"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}

        <Pagination
          currentPage={couponPage}
          totalPages={couponTotalPages}
          totalItems={coupons.length}
          onPageChange={setCouponPage}
        />
      </div>
    </div>
  );
}
