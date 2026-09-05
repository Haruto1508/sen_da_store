import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Truck, 
  Copy, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createOrder } from '../services/api';

export default function CheckoutPage({
  cartItems,
  discountCode = '',
  discountPercent = 0,
  onOrderSuccess,
  onClearCart,
  onNavigateHome,
  onNavigateShop,
  onNavigateCart,
  onNavigateAdmin,
  initialOrderCode = null
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Hà Nội',
    paymentMethod: 'vietqr', // 'vietqr' | 'cod'
    note: ''
  });

  const [copied, setCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(Boolean(initialOrderCode));
  const [orderCode, setOrderCode] = useState(initialOrderCode || '');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialOrderCode) {
      setIsCompleted(true);
      setOrderCode(initialOrderCode);
    }
  }, [initialOrderCode]);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const freeShippingThreshold = 200000;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const bankInfo = {
    bankName: 'Vietcombank',
    bankCode: 'VCB',
    accountNumber: '1028889999',
    accountName: 'NGUYEN HOANG LONG',
    branch: 'Chi nhánh Ba Đình - Hà Nội'
  };

  const currentCode = orderCode || `SX${Math.floor(100000 + Math.random() * 900000)}`;
  const finalTotalAmount = placedOrder ? placedOrder.totalAmount : total;

  const vietQrUrl = `https://img.vietqr.io/image/VCB-${bankInfo.accountNumber}-compact2.png?amount=${finalTotalAmount}&addInfo=${currentCode}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        note: formData.note,
        paymentMethod: formData.paymentMethod,
        discountCode: discountCode || '',
        items: cartItems.map(it => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image
        }))
      };

      const result = await createOrder(payload);
      const code = result.order?.orderCode || currentCode;
      setOrderCode(code);
      setPlacedOrder(result.order || {
        orderCode: code,
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address
      });
      setIsCompleted(true);

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti is optional
      }

      if (onOrderSuccess) {
        onOrderSuccess(result.order);
      }
      if (onClearCart) {
        onClearCart();
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      // Fallback local completion
      setOrderCode(currentCode);
      setIsCompleted(true);
      if (onClearCart) onClearCart();
    } finally {
      setSubmitting(false);
    }
  };

  // Screen 1: Order Completed Successfully View
  if (isCompleted) {
    const isVietQr = (placedOrder ? placedOrder.paymentMethod : formData.paymentMethod) === 'vietqr';

    return (
      <div className="checkout-page">
        <div className="page-header-banner">
          <div className="container">
            <div className="breadcrumb">
              <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
              <span className="breadcrumb-separator">/</span>
              <button className="breadcrumb-link" onClick={onNavigateShop}>Cửa Hàng</button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Xác Nhận Đơn Hàng</span>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px 80px', maxWidth: '860px' }}>
          <div className="order-success-card">
            <div className="success-badge-icon">
              <CheckCircle2 size={46} color="#fff" />
            </div>

            <span className="section-subtitle" style={{ color: 'var(--primary)' }}>Cảm Ơn Bạn Đã Mua Hàng!</span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '6px', marginBottom: '12px' }}>
              Đặt Hàng Thành Công!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', maxWidth: '580px', margin: '0 auto 28px' }}>
              Nhà vườn Sen Xinh Garden đã tiếp nhận đơn hàng <strong>#{currentCode}</strong> và đang tiến hành chọn lọc những cây sen đá tươi khỏe nhất để đóng gói giao đến bạn.
            </p>

            {/* Order summary pill */}
            <div className="success-order-pill">
              <div>
                <span>Mã đơn hàng:</span>
                <strong>#{currentCode}</strong>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'var(--border-light)' }} />
              <div>
                <span>Tổng thanh toán:</span>
                <strong style={{ color: 'var(--primary)' }}>{formatPrice(finalTotalAmount)}</strong>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'var(--border-light)' }} />
              <div>
                <span>Hình thức:</span>
                <strong>{isVietQr ? 'Chuyển Khoản VietQR' : 'Tiền Mặt (COD)'}</strong>
              </div>
            </div>

            {/* VietQR Payment Details if QR */}
            {isVietQr ? (
              <div className="vietqr-full-card">
                <div className="vietqr-card-header">
                  <QrCode size={22} color="var(--primary)" />
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>Quét Mã VietQR Để Hoàn Tất Thanh Toán</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Sử dụng ứng dụng bất kỳ của 40+ ngân hàng Việt Nam (Vietcombank, MBBank, Techcombank...)
                    </p>
                  </div>
                </div>

                <div className="vietqr-card-body">
                  <div className="vietqr-image-wrap">
                    <img src={vietQrUrl} alt="Mã VietQR Chuyển Khoản" className="vietqr-img" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px', display: 'block' }}>
                      Mã QR tự động điền số tiền và nội dung đơn
                    </span>
                  </div>

                  <div className="vietqr-info-list">
                    <div className="qr-info-item">
                      <span className="qr-info-label">Ngân hàng thụ hưởng:</span>
                      <strong className="qr-info-val">{bankInfo.bankName} ({bankInfo.bankCode})</strong>
                    </div>

                    <div className="qr-info-item">
                      <span className="qr-info-label">Chủ tài khoản:</span>
                      <strong className="qr-info-val">{bankInfo.accountName}</strong>
                    </div>

                    <div className="qr-info-item highlight">
                      <span className="qr-info-label">Số tài khoản:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong className="qr-info-val" style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                          {bankInfo.accountNumber}
                        </strong>
                        <button className="copy-btn" onClick={handleCopyAccount} title="Sao chép số tài khoản">
                          <Copy size={15} />
                          <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="qr-info-item">
                      <span className="qr-info-label">Số tiền cần chuyển:</span>
                      <strong className="qr-info-val" style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>
                        {formatPrice(finalTotalAmount)}
                      </strong>
                    </div>

                    <div className="qr-info-item">
                      <span className="qr-info-label">Nội dung chuyển khoản:</span>
                      <strong className="qr-info-val" style={{ background: '#FFF3E0', padding: '2px 8px', borderRadius: '4px', color: '#B44D28' }}>
                        {currentCode}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cod-info-card">
                <Truck size={36} color="var(--primary)" style={{ marginBottom: '10px' }} />
                <h3>Thanh Toán Bằng Tiền Mặt Khi Nhận Hàng (COD)</h3>
                <p>
                  Đơn hàng của bạn sẽ được nhân viên bưu tá giao tận nơi. Bạn có thể kiểm tra cây sen đá trước khi thanh toán số tiền <strong>{formatPrice(finalTotalAmount)}</strong> cho shipper nhé!
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="success-actions">
              <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '14px 28px' }}>
                <ShoppingBag size={18} />
                <span>Tiếp Tục Khám Phá Cửa Hàng</span>
              </button>

              <button className="btn-secondary" onClick={onNavigateAdmin} style={{ padding: '14px 24px' }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span>Xem Đơn Trên Trang Quản Trị</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Screen 2: Empty Cart in Checkout
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '600px' }}>
          <ShoppingBag size={64} style={{ color: 'var(--moss)', opacity: 0.4, marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Không có sản phẩm nào để thanh toán</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
            Giỏ hàng của bạn đang trống. Hãy chọn thêm các cây sen đá bạn yêu thích trước khi tiến hành đặt hàng nhé!
          </p>
          <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '14px 28px' }}>
            <span>Quay Lại Cửa Hàng</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Screen 3: Checkout Form
  return (
    <div className="checkout-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <button className="breadcrumb-link" onClick={onNavigateCart}>Giỏ Hàng</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Thanh Toán Đơn Hàng</span>
          </div>

          <div style={{ marginTop: '14px' }}>
            <span className="section-subtitle" style={{ color: 'var(--accent)' }}>Xác Nhận & Đặt Hàng</span>
            <h1 className="page-title" style={{ fontSize: '2.4rem', marginTop: '4px' }}>
              Thông Tin Giao Hàng & Thanh Toán
            </h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        <form onSubmit={handleSubmitOrder} className="checkout-layout">
          {/* Left Column: Delivery Info & Payment Method */}
          <div className="checkout-form-column">
            {/* Step 1: Customer Details */}
            <div className="checkout-card">
              <div className="card-section-header">
                <div className="step-num">1</div>
                <div>
                  <h3 className="card-section-title">Thông Tin Nhận Hàng</h3>
                  <p className="card-section-subtitle">Chúng tôi sẽ liên hệ xác nhận và giao cây đến địa chỉ này</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Họ và tên người nhận <span style={{ color: '#E63946' }}>*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại liên hệ <span style={{ color: '#E63946' }}>*</span></label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="Ví dụ: 0988 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Địa chỉ nhận hàng chi tiết <span style={{ color: '#E63946' }}>*</span></label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Số nhà, tên đường, ngõ ngách, phường/xã..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tỉnh / Thành phố</label>
                  <select
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Lạt">Đà Lạt - Lâm Đồng</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Khác">Tỉnh thành khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú thêm cho người giao (Tùy chọn)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Giao vào giờ hành chính, gọi trước khi giao..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="checkout-card" style={{ marginTop: '24px' }}>
              <div className="card-section-header">
                <div className="step-num">2</div>
                <div>
                  <h3 className="card-section-title">Phương Thức Thanh Toán</h3>
                  <p className="card-section-subtitle">Lựa chọn hình thức thanh toán thuận tiện nhất cho bạn</p>
                </div>
              </div>

              <div className="payment-options">
                <label className={`payment-card ${formData.paymentMethod === 'vietqr' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vietqr"
                    checked={formData.paymentMethod === 'vietqr'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'vietqr' })}
                    style={{ display: 'none' }}
                  />
                  <div className="payment-card-left">
                    <div className="payment-icon-wrap" style={{ background: '#EBF4EE', color: 'var(--primary)' }}>
                      <QrCode size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1rem' }}>Chuyển Khoản Ngân Hàng Qua Mã VietQR</strong>
                        <span className="badge-recommend">Khuyên Dùng</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Quét mã QR 24/7 tự động điền số tiền và mã đơn. Xác nhận lập tức qua ngân hàng.
                      </p>
                    </div>
                  </div>
                  <div className="radio-dot" />
                </label>

                <label className={`payment-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    style={{ display: 'none' }}
                  />
                  <div className="payment-card-left">
                    <div className="payment-icon-wrap" style={{ background: '#FFF4E5', color: 'var(--accent)' }}>
                      <Truck size={24} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>Thanh Toán Khi Nhận Hàng (COD)</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Nhận cây, kiểm tra bầu đất và sen đá tận nơi rồi thanh toán tiền mặt cho bưu tá.
                      </p>
                    </div>
                  </div>
                  <div className="radio-dot" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review Summary */}
          <div className="checkout-summary-column">
            <div className="checkout-summary-card">
              <h3 className="summary-title">Đơn Hàng ({cartItems.reduce((cnt, it) => cnt + it.quantity, 0)} cây)</h3>

              {/* Items preview */}
              <div className="checkout-items-preview">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={item.image} alt={item.name} className="checkout-item-thumb" />
                        <span className="checkout-item-qty-badge">{item.quantity}</span>
                      </div>
                      <div>
                        <h4 className="checkout-item-name">{item.name}</h4>
                        <span className="checkout-item-unit">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                    <strong className="checkout-item-total">{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="summary-rows" style={{ marginTop: '20px' }}>
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="summary-row discount">
                    <span>Mã ưu đãi ({discountCode} -{discountPercent}%):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>{isFreeShipping ? <strong style={{ color: 'var(--primary)' }}>Miễn Phí</strong> : formatPrice(shippingFee)}</span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="summary-total-price">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ width: '100%', padding: '16px 20px', fontSize: '1.05rem', fontWeight: 700, marginTop: '24px' }}
              >
                {submitting ? (
                  <span>Đang Tạo Đơn Hàng...</span>
                ) : (
                  <>
                    <span>Xác Nhận Đặt Hàng ({formatPrice(total)})</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onNavigateCart}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  ← Quay Lại Giỏ Hàng
                </button>
              </div>

              {/* Guarantee */}
              <div style={{ marginTop: '20px', padding: '12px', background: '#F8FAF7', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>Bảo mật 100%. Được mở gói đồng kiểm tra cây trước khi nhận.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
