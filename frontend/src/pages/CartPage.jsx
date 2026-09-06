import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Check 
} from 'lucide-react';

export default function CartPage({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  discountCode,
  discountPercent,
  onApplyCoupon,
  onNavigateShop,
  onNavigateCheckout,
  onNavigateHome,
  onOpenProductDetail
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const freeShippingThreshold = 200000;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const totalItemCount = cartItems.reduce((cnt, it) => cnt + it.quantity, 0);

  const handleApplyCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = onApplyCoupon(couponInput.trim());
    if (ok) {
      setCouponSuccess(true);
      setCouponError('');
      setCouponInput('');
      setTimeout(() => setCouponSuccess(false), 3000);
    } else {
      setCouponError('Mã ưu đãi không hợp lệ. Hãy thử mã SENXANH10 (-10%) hoặc SENXANH20 (-20%)!');
      setCouponSuccess(false);
    }
  };

  return (
    <div className="cart-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <button className="breadcrumb-link" onClick={onNavigateShop}>Cửa Hàng</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Giỏ Hàng Của Bạn</span>
          </div>

          <div style={{ marginTop: '14px' }}>
            <span className="section-subtitle" style={{ color: 'var(--accent)' }}>Túi Mầm Xanh</span>
            <h1 className="page-title" style={{ fontSize: '2.4rem', marginTop: '4px' }}>
              Giỏ Hàng Của Bạn ({totalItemCount} sản phẩm)
            </h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="cart-empty-box">
            <div className="cart-empty-icon">
              <ShoppingBag size={56} />
            </div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>
              Góc ban công hay bàn làm việc của bạn vẫn đang chờ một chậu sen đá đáng yêu đấy! Hãy ghé thăm vườn cây của Sen Xinh Garden để chọn ngay nhé.
            </p>
            <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '14px 32px', fontSize: '1rem', marginTop: '12px' }}>
              <span>Khám Phá Cửa Hàng Ngay</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* Cart Content Layout: 2 Columns */
          <div className="cart-layout">
            {/* Left Column: Items List */}
            <div className="cart-items-column">
              <div className="cart-table-header">
                <span style={{ flex: 3 }}>Sản Phẩm</span>
                <span style={{ flex: 1.2, textAlign: 'center' }}>Đơn Giá</span>
                <span style={{ flex: 1.5, textAlign: 'center' }}>Số Lượng</span>
                <span style={{ flex: 1.2, textAlign: 'right' }}>Tạm Tính</span>
                <span style={{ width: '40px' }}></span>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    {/* Item info */}
                    <div className="cart-item-info" onClick={() => onOpenProductDetail && onOpenProductDetail(item.id)}>
                      <img src={item.image} alt={item.name} className="cart-item-thumb" />
                      <div>
                        <h3 className="cart-item-name">{item.name}</h3>
                        {item.scientificName && (
                          <p className="cart-item-latin">{item.scientificName}</p>
                        )}
                        <span className="cart-item-price-mobile">{formatPrice(item.price)}</span>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="cart-item-unit-price">
                      {formatPrice(item.price)}
                    </div>

                    {/* Qty control */}
                    <div className="cart-item-qty-wrap">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          title="Giảm số lượng"
                          aria-label="Giảm"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                          title="Tăng số lượng"
                          aria-label="Tăng"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="cart-item-line-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>

                    {/* Delete button */}
                    <button
                      className="cart-item-remove-btn"
                      onClick={() => onRemoveItem(item.id)}
                      title="Xóa khỏi giỏ hàng"
                      aria-label="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Back to shop link */}
              <div style={{ marginTop: '24px' }}>
                <button className="btn-secondary" onClick={onNavigateShop} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  <ArrowLeft size={16} />
                  <span>Tiếp Tục Chọn Cây Khác</span>
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>

                {/* Coupon Box */}
                <form onSubmit={handleApplyCouponSubmit} className="coupon-form">
                  <div className="coupon-input-wrap">
                    <Tag size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Nhập mã ưu đãi (SENXANH10)..."
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                    />
                    <button type="submit" className="coupon-apply-btn">Áp Dụng</button>
                  </div>
                  {couponError && <p className="coupon-msg-error">{couponError}</p>}
                  {couponSuccess && (
                    <p className="coupon-msg-success">
                      <Check size={14} /> Đã áp dụng mã ưu đãi thành công!
                    </p>
                  )}
                  {discountCode && (
                    <div className="coupon-applied-pill">
                      <span>Mã đang dùng: <strong>{discountCode}</strong> (-{discountPercent}%)</span>
                    </div>
                  )}
                </form>

                {/* Summary rows */}
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Tổng tiền hàng:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="summary-row discount">
                      <span>Giảm giá voucher ({discountPercent}%):</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span>{isFreeShipping ? <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Miễn Phí</span> : formatPrice(shippingFee)}</span>
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-row total">
                    <span>Tổng thanh toán:</span>
                    <span className="summary-total-price">{formatPrice(total)}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px', textAlign: 'right' }}>
                    (Đã bao gồm thuế GTGT nếu có)
                  </p>
                </div>

                {/* Checkout button */}
                <button
                  className="btn-primary"
                  onClick={onNavigateCheckout}
                  style={{ width: '100%', padding: '16px 20px', fontSize: '1.05rem', fontWeight: 700, marginTop: '24px' }}
                >
                  <span>Tiến Hành Đặt Hàng & Thanh Toán</span>
                  <ArrowRight size={18} />
                </button>

                {/* Trust Badges */}
                <div className="cart-trust-badges">
                  <div className="trust-item">
                    <ShieldCheck size={18} color="var(--primary)" />
                    <span>Bảo hành hoàn tiền 100% nếu cây bị gãy hỏng</span>
                  </div>
                  <div className="trust-item">
                    <Truck size={18} color="var(--primary)" />
                    <span>Đóng gói chuyên dụng giữ ẩm và bảo vệ bầu đất</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
