import React from 'react';
import {
  Tag,
  Loader2,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf
} from 'lucide-react';

export default function CartSummaryCard({
  couponInput,
  setCouponInput,
  couponError,
  setCouponError,
  couponSuccess,
  couponLoading,
  handleApplyCouponSubmit,
  discountCode,
  discountPercent,
  onRemoveCoupon,
  formatPrice,
  subtotal,
  discountAmount,
  isFreeShipping,
  shippingFee,
  total,
  hasUnavailableItem,
  hasOutOfStockItem,
  cartItems,
  onNavigateCheckout
}) {
  const isCheckoutDisabled = hasUnavailableItem || hasOutOfStockItem || cartItems.length === 0;

  return (
    <div className="cx-summary-col">
      <div className="cx-summary-card">
        <div className="cx-summary-title">Tóm Tắt Đơn Hàng</div>

        {/* Coupon Form */}
        <form onSubmit={handleApplyCouponSubmit} className="cx-coupon-form">
          <div className="cx-coupon-row">
            <Tag size={16} className="cx-coupon-icon" />
            <input
              type="text"
              className="cx-coupon-input"
              placeholder="Nhập mã ưu đãi..."
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError('');
              }}
              disabled={couponLoading}
            />
            <button type="submit" className="cx-coupon-btn" disabled={couponLoading}>
              {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Áp Dụng'}
            </button>
          </div>
          {couponError && <p className="cx-coupon-msg-error">{couponError}</p>}
          {couponSuccess && (
            <p className="cx-coupon-msg-ok">
              <Check size={14} /> Đã áp dụng mã thành công!
            </p>
          )}
          {discountCode && (
            <div className="cx-coupon-applied">
              <span>
                Mã: <strong>{discountCode}</strong> (-{discountPercent}%)
              </span>
              {onRemoveCoupon && (
                <button type="button" className="cx-coupon-remove" onClick={onRemoveCoupon}>
                  <X size={15} />
                </button>
              )}
            </div>
          )}
        </form>

        {/* Price Breakdown */}
        <div className="cx-summary-rows">
          <div className="cx-summary-row">
            <span>Tổng tiền hàng:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="cx-summary-row discount">
              <span>Giảm giá ({discountPercent}%):</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="cx-summary-row">
            <span>Phí vận chuyển:</span>
            <span>{isFreeShipping ? <strong style={{ color: 'var(--primary)' }}>Miễn Phí</strong> : formatPrice(shippingFee)}</span>
          </div>
        </div>

        <div className="cx-summary-sep" style={{ margin: '14px 0' }} />
        <div className="cx-summary-total">
          <span>Tổng thanh toán:</span>
          <span className="cx-summary-total-price">{formatPrice(total)}</span>
        </div>
        <p className="cx-vat-note">(Đã bao gồm thuế GTGT nếu có)</p>

        {/* Warnings */}
        {hasUnavailableItem && (
          <div className="cx-warning-box danger">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>Có sản phẩm không còn kinh doanh. Xóa trước khi thanh toán.</span>
          </div>
        )}
        {!hasUnavailableItem && hasOutOfStockItem && (
          <div className="cx-warning-box warn">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>Có sản phẩm hết hàng. Xóa trước khi thanh toán.</span>
          </div>
        )}

        {/* Checkout Button */}
        <button
          className="btn-primary"
          onClick={onNavigateCheckout}
          disabled={isCheckoutDisabled}
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: '1rem',
            fontWeight: 700,
            marginTop: '20px',
            opacity: isCheckoutDisabled ? 0.6 : 1,
            cursor: isCheckoutDisabled ? 'not-allowed' : 'pointer'
          }}
        >
          <span>Tiến Hành Đặt Hàng</span>
          <ArrowRight size={18} />
        </button>

        {/* Trust Badges */}
        <div className="cx-trust">
          <div className="cx-trust-item">
            <div className="cx-trust-icon">
              <ShieldCheck size={16} />
            </div>
            <span>Bảo hành hoàn tiền 100% nếu cây bị gãy hỏng</span>
          </div>
          <div className="cx-trust-item">
            <div className="cx-trust-icon">
              <Truck size={16} />
            </div>
            <span>Đóng gói chuyên dụng giữ ẩm bảo vệ bầu đất</span>
          </div>
          <div className="cx-trust-item">
            <div className="cx-trust-icon">
              <Leaf size={16} />
            </div>
            <span>Giao hàng toàn quốc 2-5 ngày làm việc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
