import React from 'react';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function CheckoutOrderSummary({
  checkoutItems,
  formatPrice,
  subtotal,
  discountAmount,
  discountCode,
  discountPercent,
  shippingFee,
  isFreeShipping,
  cityName,
  total,
  totalItemCount,
  submitting
}) {
  return (
    <div className="chk-summary-col">
      <div className="chk-summary-card">
        <h3 className="chk-summary-title">Đơn hàng ({totalItemCount} sản phẩm)</h3>

        {/* Items preview list */}
        <div className="chk-items-preview">
          {checkoutItems.map((item) => (
            <div key={item.id} className="chk-preview-item">
              <div className="chk-preview-item-left">
                <div className="chk-preview-thumb-wrap">
                  <img src={item.image} alt={item.name} className="chk-preview-thumb" />
                  <span className="chk-preview-qty-badge">{item.quantity}</span>
                </div>
                <div className="chk-preview-info">
                  <div className="chk-preview-name">{item.name}</div>
                  <div className="chk-preview-unit">{formatPrice(item.price)}</div>
                </div>
              </div>
              <span className="chk-preview-price">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="chk-price-sep" />
        <div className="chk-price-rows">
          <div className="chk-price-row">
            <span>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="chk-price-row discount">
              <span>Mã giảm giá ({discountCode} -{discountPercent}%)</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="chk-price-row">
            <span>Phí vận chuyển ({cityName || 'Khu vực'})</span>
            <span>{isFreeShipping ? <strong className="green-color">Miễn Phí</strong> : formatPrice(shippingFee)}</span>
          </div>
        </div>

        <div className="chk-price-sep" />
        <div className="chk-price-total">
          <span className="chk-price-total-label">Tổng thanh toán</span>
          <span className="chk-price-total-val">{formatPrice(total)}</span>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="chk-submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Đang xử lý đơn hàng...</span>
            </>
          ) : (
            <>
              <span>Đặt Hàng • {formatPrice(total)}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Guarantee Notes */}
        <div className="chk-guarantee">
          <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>Đồng kiểm khi nhận • Bảo hành sống 100% trong quá trình vận chuyển.</span>
        </div>
      </div>
    </div>
  );
}
