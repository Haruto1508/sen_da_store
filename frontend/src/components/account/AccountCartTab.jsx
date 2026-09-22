import React from 'react';
import { ShoppingBag, Minus, Plus, Trash2, Tag, Sparkles, ArrowRight } from 'lucide-react';
import { formatPrice } from './accountConstants';

export default function AccountCartTab({
  cartItems,
  onNavigateCart,
  onNavigateShop,
  onOpenProductDetail,
  onUpdateQty,
  onRemoveItem,
  couponInput,
  setCouponInput,
  handleApplyCouponSubmit,
  couponSuccess,
  couponError,
  discountPercent,
  discountCode,
  discountAmount,
  subtotal,
  shippingFee,
  total,
  onNavigateCheckout
}) {
  return (
    <div className="account-tab-content">
      <div className="account-card">
        <div className="account-card-header" style={{ marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Giỏ Hàng Của Bạn</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              Xem lại các chậu sen đá đã chọn, áp dụng mã giảm giá và thanh toán nhanh chóng
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              onClick={() => onNavigateCart && onNavigateCart({ state: { from: 'account' } })}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <span>Trang Giỏ Hàng Đầy Đủ</span>
              <ArrowRight size={15} />
            </button>
            <button 
              className="btn-secondary" 
              onClick={onNavigateShop}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <span>Chọn Thêm Cây</span>
            </button>
          </div>
        </div>

        {(!cartItems || cartItems.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
            <ShoppingBag size={48} style={{ opacity: 0.3, color: 'var(--primary)', marginBottom: '14px' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Giỏ Hàng Hiện Đang Trống</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              Góc bàn làm việc hay ban công của bạn vẫn đang chờ một chậu sen đá xinh xắn đấy!
            </p>
            <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '12px 28px' }}>
              <Sparkles size={16} />
              <span>Mua Sắm Ngay</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: '#fff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px'
                  }}
                >
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', flex: 1, minWidth: '240px' }}
                    onClick={() => onOpenProductDetail && onOpenProductDetail(item.id)}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                    />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      className="qty-btn"
                      onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity - 1)}
                      title="Giảm số lượng"
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                      {item.quantity}
                    </span>
                    <button 
                      className="qty-btn"
                      onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity + 1)}
                      title="Tăng số lượng"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Total and remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--primary)', minWidth: '90px', textAlign: 'right' }}>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                    <button 
                      className="icon-btn-danger"
                      onClick={() => onRemoveItem && onRemoveItem(item.id)}
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Voucher Section */}
            <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              {/* Coupon form */}
              <form onSubmit={handleApplyCouponSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Tag size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input 
                    type="text"
                    placeholder="Mã giảm giá (ví dụ: SENXANH10, SENXANH20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '40px', background: '#fff' }}
                  />
                </div>
                <button type="submit" className="btn-secondary" style={{ padding: '0 24px', whiteSpace: 'nowrap' }}>
                  Áp Dụng
                </button>
              </form>

              {couponSuccess && (
                <div style={{ color: '#059669', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600 }}>
                  ✓ Đã áp dụng mã giảm giá thành công!
                </div>
              )}
              {couponError && (
                <div style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '14px' }}>
                  {couponError}
                </div>
              )}

              {/* Totals table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{formatPrice(subtotal)}</strong>
                </div>

                {discountPercent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Mã giảm giá ({discountCode} -{discountPercent}%):</span>
                    <strong>-{formatPrice(discountAmount)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>Miễn phí (0đ)</strong> : formatPrice(shippingFee)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px dashed var(--border-light)', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout button */}
              <button 
                className="btn-primary"
                onClick={onNavigateCheckout}
                style={{ width: '100%', padding: '15px', fontSize: '1.05rem', marginTop: '20px', justifyContent: 'center' }}
              >
                <span>Tiến Hành Đặt Hàng Ngay</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
