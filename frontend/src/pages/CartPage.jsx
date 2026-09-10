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
  Check,
  X,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function CartPage({
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  discountCode = '',
  discountPercent = 0,
  onApplyCoupon,
  onRemoveCoupon,
  onNavigateShop,
  onNavigateCheckout,
  onNavigateHome,
  onOpenProductDetail
}) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const freeShippingThreshold = 200000;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const totalItemCount = cartItems.reduce((cnt, it) => cnt + it.quantity, 0);

  // Kiểm tra xem có sản phẩm nào trong giỏ bị hết hàng không
  const hasOutOfStockItem = cartItems.some(
    (item) => item.inStock !== undefined && item.inStock <= 0
  );

  const handleApplyCouponSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = couponInput.trim();
    if (!cleanCode || couponLoading) return;

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess(false);

    try {
      if (onApplyCoupon) {
        const res = await onApplyCoupon(cleanCode);
        if (res && (res.success || res === true)) {
          setCouponSuccess(true);
          setCouponError('');
          setCouponInput('');
          setTimeout(() => setCouponSuccess(false), 4000);
        } else {
          setCouponError(
            res?.message || 'Mã ưu đãi không hợp lệ. Hãy thử mã SENXANH10 (-10%) hoặc SENXANH20 (-20%)!'
          );
          setCouponSuccess(false);
        }
      }
    } catch (err) {
      setCouponError(err.message || 'Lỗi khi kiểm tra mã ưu đãi');
      setCouponSuccess(false);
    } finally {
      setCouponLoading(false);
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
            <div>
              <span className="section-subtitle" style={{ color: 'var(--accent)' }}>Túi Mầm Xanh</span>
              <h1 className="page-title" style={{ fontSize: '2rem', marginTop: '4px' }}>
                Giỏ Hàng Của Bạn ({totalItemCount} sản phẩm)
              </h1>
            </div>

            {cartItems.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {onClearCart && (
                  <button
                    className="btn-secondary"
                    onClick={onClearCart}
                    style={{ padding: '10px 18px', fontSize: '0.9rem', color: '#DC2626' }}
                    title="Xóa toàn bộ sản phẩm khỏi giỏ hàng"
                  >
                    <Trash2 size={16} />
                    <span>Xóa Sạch Giỏ Hàng</span>
                  </button>
                )}
                <button
                  className="btn-secondary"
                  onClick={onNavigateShop}
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Tiếp Tục Chọn Cây</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        {/* Free Shipping Banner */}
        {cartItems.length > 0 && (
          <div className="cart-freeship-banner">
            <div className="freeship-info">
              <Truck size={20} color="var(--primary)" />
              <span>
                {remainingForFreeShip === 0 ? (
                  <strong style={{ color: 'var(--primary)' }}>
                    🎉 Tuyệt vời! Đơn hàng của bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN toàn quốc!
                  </strong>
                ) : (
                  <span>
                    Mua thêm <strong>{formatPrice(remainingForFreeShip)}</strong> để nhận ưu đãi <strong>Miễn Phí Giao Hàng</strong>!
                  </span>
                )}
              </span>
              <span className="freeship-percent">{progressPercent}%</span>
            </div>
            <div className="freeship-progress-track">
              <div className="freeship-progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

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
                {cartItems.map((item) => {
                  const isOutOfStock = item.inStock !== undefined && item.inStock <= 0;
                  const isLowStock = item.inStock !== undefined && item.inStock > 0 && item.inStock <= 5;
                  const maxAllowed = item.inStock !== undefined ? item.inStock : 999;
                  const isMaxReached = item.quantity >= maxAllowed;

                  return (
                    <div
                      key={item.id}
                      className="cart-item-row"
                      style={isOutOfStock ? { opacity: 0.75, background: '#FFF8F8', borderColor: '#FECACA' } : {}}
                    >
                      {/* Item info */}
                      <div className="cart-item-info" onClick={() => onOpenProductDetail && onOpenProductDetail(item.id)}>
                        <img src={item.image} alt={item.name} className="cart-item-thumb" />
                        <div>
                          <h3 className="cart-item-name">{item.name}</h3>
                          {item.scientificName && (
                            <p className="cart-item-latin">{item.scientificName}</p>
                          )}
                          <div className="cart-item-price-mobile">
                            <span>{formatPrice(item.price)}</span>
                            {item.originalPrice > item.price && (
                              <del style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: '6px' }}>
                                {formatPrice(item.originalPrice)}
                              </del>
                            )}
                          </div>

                          {/* Live stock indicator */}
                          {item.inStock !== undefined && (
                            <div style={{ marginTop: '4px' }}>
                              {isOutOfStock ? (
                                <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <AlertTriangle size={12} /> Tạm hết hàng trong kho
                                </span>
                              ) : isLowStock ? (
                                <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 600 }}>
                                  Chỉ còn {item.inStock} cây trong kho
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                                  Kho còn {item.inStock} cây
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Unit price */}
                      <div className="cart-item-unit-price">
                        <div>{formatPrice(item.price)}</div>
                        {item.originalPrice > item.price && (
                          <del style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 400 }}>
                            {formatPrice(item.originalPrice)}
                          </del>
                        )}
                      </div>

                      {/* Qty control */}
                      <div className="cart-item-qty-wrap" style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isOutOfStock}
                            title="Giảm số lượng"
                            aria-label="Giảm"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity + 1)}
                            disabled={isMaxReached || isOutOfStock}
                            title={isMaxReached ? `Đã đạt giới hạn tối đa có trong kho (${maxAllowed} cây)` : 'Tăng số lượng'}
                            aria-label="Tăng"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        {isMaxReached && !isOutOfStock && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '4px' }}>
                            Tối đa trong kho
                          </span>
                        )}
                      </div>

                      {/* Line total */}
                      <div className="cart-item-line-total">
                        {formatPrice(item.price * item.quantity)}
                      </div>

                      {/* Delete button */}
                      <button
                        className="cart-item-remove-btn"
                        onClick={() => onRemoveItem && onRemoveItem(item.id)}
                        title="Xóa khỏi giỏ hàng"
                        aria-label="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
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
                      disabled={couponLoading}
                    />
                    <button type="submit" className="coupon-apply-btn" disabled={couponLoading}>
                      {couponLoading ? <Loader2 size={14} className="spin" /> : 'Áp Dụng'}
                    </button>
                  </div>

                  {couponError && <p className="coupon-msg-error">{couponError}</p>}
                  {couponSuccess && (
                    <p className="coupon-msg-success">
                      <Check size={14} /> Đã áp dụng mã ưu đãi thành công!
                    </p>
                  )}

                  {discountCode && (
                    <div className="coupon-applied-pill" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Mã đang dùng: <strong>{discountCode}</strong> (-{discountPercent}%)</span>
                      {onRemoveCoupon && (
                        <button
                          type="button"
                          onClick={onRemoveCoupon}
                          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                          title="Gỡ mã ưu đãi"
                        >
                          <X size={14} />
                        </button>
                      )}
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
                    <span>
                      {isFreeShipping ? (
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Miễn Phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
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

                {/* Warning if any item is out of stock */}
                {hasOutOfStockItem && (
                  <div style={{ marginTop: '16px', padding: '10px 14px', background: '#FEE2E2', border: '1px solid #F87171', borderRadius: 'var(--radius-sm)', color: '#991B1B', fontSize: '0.85rem' }}>
                    <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    Có sản phẩm trong giỏ đã hết hàng. Vui lòng xóa trước khi thanh toán.
                  </div>
                )}

                {/* Checkout button */}
                <button
                  className="btn-primary"
                  onClick={onNavigateCheckout}
                  disabled={hasOutOfStockItem || cartItems.length === 0}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    marginTop: '20px',
                    opacity: hasOutOfStockItem ? 0.6 : 1,
                    cursor: hasOutOfStockItem ? 'not-allowed' : 'pointer'
                  }}
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
