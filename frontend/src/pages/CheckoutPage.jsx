import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Truck, 
  Copy, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Smartphone,
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  createOrder, 
  createMoMoPayment, 
  lookupOrder, 
  checkOrderStatus,
  getShippingConfig,
  fetchShippingConfig
} from '../services/api';
import useModal from '../components/useModal';
import NotificationModal from '../components/NotificationModal';

export default function CheckoutPage({
  user,
  cartItems = [],
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
  const navigate = useNavigate();
  const location = useLocation();
  const directBuyItem = location.state?.buyNowItem || location.state?.directBuyItem;
  const isDirectBuy = Boolean(directBuyItem);
  const checkoutItems = isDirectBuy ? [directBuyItem] : (cartItems || []);
  const isAdmin = Boolean(
    user && (user.role?.toLowerCase().includes('admin') || user.email === 'admin@senxinh.vn')
  );

  // Notification Modal
  const { modalProps, showModal } = useModal();

  const detectCity = (addr) => {
    if (!addr) return 'Hà Nội';
    if (addr.includes('Hồ Chí Minh') || addr.includes('TP.HCM') || addr.includes('Sài Gòn')) return 'TP. Hồ Chí Minh';
    if (addr.includes('Đà Lạt') || addr.includes('Lâm Đồng')) return 'Đà Lạt';
    if (addr.includes('Đà Nẵng')) return 'Đà Nẵng';
    if (addr.includes('Hải Phòng')) return 'Hải Phòng';
    if (addr.includes('Cần Thơ')) return 'Cần Thơ';
    if (addr.includes('Hà Nội')) return 'Hà Nội';
    return 'Hà Nội';
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: detectCity(user?.address),
    paymentMethod: 'vietqr', // 'vietqr' | 'momo' | 'cod'
    note: ''
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name || '',
        phone: user.phone || prev.phone || '',
        address: user.address || prev.address || '',
        city: detectCity(user.address) || prev.city
      }));
    }
  }, [user]);

  const [copiedKey, setCopiedKey] = useState('');
  const [isCompleted, setIsCompleted] = useState(Boolean(initialOrderCode));
  const [orderCode, setOrderCode] = useState(initialOrderCode || '');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [momoData, setMomoData] = useState(null);
  const [vietQrData, setVietQrData] = useState(null);
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  useEffect(() => {
    if (initialOrderCode) {
      setIsCompleted(true);
      setOrderCode(initialOrderCode);
      lookupOrder(initialOrderCode)
        .then((ord) => {
          if (ord) {
            setPlacedOrder(ord);
            if (ord.status) setOrderStatus(ord.status);
          }
        })
        .catch(() => {});
    }
  }, [initialOrderCode]);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 1), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  const [shippingConfig, setShippingConfig] = useState(getShippingConfig());

  useEffect(() => {
    fetchShippingConfig().then((cfg) => {
      if (cfg) setShippingConfig(cfg);
    });
  }, []);

  const freeShippingThreshold = shippingConfig?.freeShippingThreshold || 200000;
  const freeShippingEnabled = shippingConfig?.freeShippingEnabled !== false;
  const isFreeShipping = (freeShippingEnabled && subtotal >= freeShippingThreshold) || subtotal === 0;

  // Tra cứu cước phí vận chuyển theo Tỉnh / Thành phố đã chọn
  const getCityShippingFee = (cityName) => {
    if (!cityName) return shippingConfig?.defaultShippingFee || 35000;
    const rates = shippingConfig?.provinceRates || [];
    const matched = rates.find((r) =>
      r.province.toLowerCase() === cityName.toLowerCase() ||
      cityName.toLowerCase().includes(r.province.toLowerCase()) ||
      r.province.toLowerCase().includes(cityName.toLowerCase())
    );
    if (matched) return matched.fee;
    return shippingConfig?.defaultShippingFee || 35000;
  };

  const currentCityFee = getCityShippingFee(formData.city);
  const shippingFee = isFreeShipping ? 0 : currentCityFee;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemCount = checkoutItems.reduce((cnt, it) => cnt + (it.quantity || 1), 0);

  const bankInfo = {
    bankName: 'MBBank',
    bankCode: 'MBBank',
    accountNumber: 'VQRQALYXL6596', // Tài khoản ảo SePay (VA)
    primaryAccountNumber: '0001761675223',
    accountName: 'NGUYEN HOANG THAI VINH',
    branch: 'Ngân hàng TMCP Quân Đội (MBBank)'
  };

  const activeBankInfo = {
    bankName: vietQrData?.bankName || bankInfo.bankName,
    bankCode: vietQrData?.bankCode || bankInfo.bankCode,
    accountNumber: vietQrData?.accountNumber || bankInfo.accountNumber,
    primaryAccountNumber: bankInfo.primaryAccountNumber,
    accountName: vietQrData?.accountName || bankInfo.accountName,
    branch: bankInfo.branch
  };

  const currentCode = orderCode || `SX${Math.floor(100000 + Math.random() * 900000)}`;
  const finalTotalAmount = placedOrder ? (placedOrder.totalAmount !== undefined ? placedOrder.totalAmount : total) : total;

  // Cổng VietQR SePay
  const sepayAcc = activeBankInfo.accountNumber || 'VQRQALYXL6596';
  const sepayHolder = encodeURIComponent(activeBankInfo.accountName || 'NGUYEN HOANG THAI VINH');
  const vietQrUrl = vietQrData?.qrImageUrl || `https://vietqr.app/img?bank=MBBank&acc=${sepayAcc}&template=compact&amount=${Math.round(finalTotalAmount)}&des=${currentCode}&showinfo=true&fullacc=true&holder=${sepayHolder}&store=Sen%20Xinh%20Garden`;

  const handleCopyText = (textToCopy, key) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showModal('warning', 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        city: formData.city,
        customerEmail: user?.email || formData.email || '',
        note: formData.note.trim(),
        paymentMethod: formData.paymentMethod,
        discountCode: discountCode || '',
        discountPercent: discountPercent || 0,
        discountAmount: discountAmount,
        shippingFee: shippingFee,
        subtotal: subtotal,
        totalAmount: total,
        orderCode: currentCode,
        items: checkoutItems.map(it => ({
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
      if (result.vietQr) {
        setVietQrData(result.vietQr);
      }
      setPlacedOrder(result.order || {
        orderCode: code,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: user?.email || '',
        customerAddress: formData.address,
        status: 'PENDING'
      });

      // Khởi tạo MoMo nếu khách chọn momo
      if (formData.paymentMethod === 'momo') {
        try {
          const momoRes = await createMoMoPayment(code, total);
          if (momoRes && momoRes.data) {
            setMomoData(momoRes.data);
          }
        } catch (mErr) {
          console.warn('Khởi tạo giao dịch MoMo offline fallback:', mErr);
        }
      }

      setIsCompleted(true);

      if (onOrderSuccess) {
        onOrderSuccess(result.order, isDirectBuy, directBuyItem);
      }
      if (onClearCart && !isDirectBuy) {
        onClearCart();
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      showModal('error', err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại kết nối mạng!');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-polling kiểm tra trạng thái thanh toán khi đơn hàng đang hiển thị mã QR (VietQR hoặc MoMo)
  useEffect(() => {
    if (!isCompleted || orderStatus === 'PAID') return;
    const targetCode = orderCode || placedOrder?.orderCode;
    if (!targetCode) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await checkOrderStatus(targetCode);
        if (res && res.success && res.status === 'PAID') {
          setOrderStatus('PAID');
          setPlacedOrder((prev) => ({ ...prev, status: 'PAID' }));
          try {
            confetti({
              particleCount: 160,
              spread: 90,
              origin: { y: 0.6 }
            });
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Lỗi polling trạng thái thanh toán:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isCompleted, orderStatus, orderCode, placedOrder?.orderCode]);

  // Kiểm tra trạng thái thanh toán thủ công
  const handleManualCheckPayment = async () => {
    setIsCheckingPayment(true);
    try {
      const targetCode = orderCode || placedOrder?.orderCode || currentCode;
      const res = await checkOrderStatus(targetCode);
      if (res && res.success && res.status === 'PAID') {
        setOrderStatus('PAID');
        setPlacedOrder((prev) => ({ ...prev, status: 'PAID' }));
        try {
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        showModal('success', 'Giao dịch đã được ghi nhận thành công! Đơn hàng đã chuyển sang trạng thái ĐÃ THANH TOÁN.');
      } else {
        showModal(
          'info',
          `Hệ thống đang đối soát thanh toán cho đơn hàng #${targetCode}. Nếu bạn vừa chuyển tiền, vui lòng đợi 15 - 30 giây để hệ thống tự động cập nhật trạng thái nhé.`
        );
      }
    } catch (err) {
      showModal('warning', 'Không thể kết nối máy chủ để kiểm tra trạng thái lúc này. Vui lòng thử lại sau giây lát!');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // =========================================================================
  // Screen 1: Order Completed View (Pending / Paid / QR / COD)
  // =========================================================================
  if (isCompleted) {
    const currentPaymentMethod = placedOrder ? placedOrder.paymentMethod : formData.paymentMethod;
    const isMoMo = currentPaymentMethod === 'momo';
    const isVietQr = currentPaymentMethod === 'vietqr';
    const isPaid = orderStatus === 'PAID';

    return (
      <div className="pay-page">
        {/* Simple Top Navigation */}
        <div className="chk-simple-header">
          <div className="container">
            <button className="chk-back-btn" onClick={onNavigateShop}>
              <ArrowLeft size={16} />
              <span>Quay lại cửa hàng</span>
            </button>
          </div>
        </div>

        <div className="pay-container">
          {/* Header Card */}
          <div className="pay-header-card">
            <div className={`pay-icon-ring ${isPaid ? 'paid' : ''}`}>
              <CheckCircle2 size={38} color="#fff" />
            </div>

            <span className="pay-subtitle">
              {isPaid ? 'Thanh Toán Thành Công' : 'Đặt Hàng Thành Công'}
            </span>
            <h1 className="pay-title">
              {isPaid ? 'Đơn Hàng Đã Hoàn Tất!' : 'Cảm Ơn Bạn Đã Mua Hàng!'}
            </h1>
            <p className="pay-desc">
              Nhà vườn Sen Xinh Garden đã tiếp nhận đơn hàng <strong>#{currentCode}</strong> và đang chuẩn bị những cây sen đá tươi khỏe nhất để gửi tới bạn.
            </p>

            {/* Concise Info Strip */}
            <div className="pay-info-strip">
              <div className="pay-info-item">
                <div className="pay-info-label">Mã đơn hàng</div>
                <div className="pay-info-val">#{currentCode}</div>
              </div>
              <div className="pay-info-item">
                <div className="pay-info-label">Tổng thanh toán</div>
                <div className="pay-info-val highlight">{formatPrice(finalTotalAmount)}</div>
              </div>
              <div className="pay-info-item">
                <div className="pay-info-label">Hình thức</div>
                <div className="pay-info-val">
                  {isMoMo ? 'Ví MoMo' : isVietQr ? 'Chuyển Khoản VietQR' : 'Tiền Mặt (COD)'}
                </div>
              </div>
              <div className="pay-info-item">
                <div className="pay-info-label">Trạng thái</div>
                <div className="pay-info-val">
                  {isPaid ? (
                    <span className="pay-status-pill paid">✓ Đã Thanh Toán</span>
                  ) : (
                    <span className="pay-status-pill waiting">
                      <span className="pay-pulse" />
                      Chờ Thanh Toán
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Celebration Card when PAID */}
          {isPaid && (
            <div className="pay-celebration">
              <div className="pay-celebration-badge">
                <CheckCircle2 size={32} color="#fff" />
              </div>
              <h2>Thanh Toán Đã Được Xác Nhận!</h2>
              <p>
                Hệ thống đã ghi nhận số tiền <strong>{formatPrice(finalTotalAmount)}</strong> cho đơn hàng <strong>#{currentCode}</strong>. Chúng tôi sẽ sớm giao hàng đến bạn.
              </p>
            </div>
          )}

          {/* VietQR Payment Card */}
          {!isPaid && isVietQr && (
            <div className="pay-qr-card">
              <div className="pay-qr-header vqr">
                <div className="pay-qr-brand">
                  <div className="pay-qr-brand-icon vqr">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <div className="pay-qr-brand-name">Chuyển Khoản VietQR</div>
                    <div className="pay-qr-brand-sub">Quét mã QR bằng mọi App Ngân Hàng • Xác nhận tự động 24/7</div>
                  </div>
                </div>

                <div className="pay-status-pill waiting">
                  <span className="pay-pulse" />
                  <span>Chờ giao dịch...</span>
                </div>
              </div>

              <div className="pay-qr-body">
                <div className="pay-qr-img-col">
                  <div className="pay-qr-frame vqr-border">
                    <img src={vietQrUrl} alt="Mã VietQR Chuyển Khoản" className="pay-qr-img" />
                  </div>
                  <div className="pay-qr-caption">Quét bằng App Ngân Hàng để tự động điền số tiền & nội dung</div>
                </div>

                <div className="pay-qr-info">
                  <div className="pay-qr-grid-info">
                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Ngân hàng thụ hưởng</div>
                      <div className="pay-qr-row-val">{activeBankInfo.bankName} ({activeBankInfo.bankCode})</div>
                    </div>

                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Chủ tài khoản</div>
                      <div className="pay-qr-row-val">{activeBankInfo.accountName}</div>
                    </div>

                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Số tài khoản</div>
                      <div className="pay-copy-row">
                        <span className="pay-qr-row-val big green-color">{activeBankInfo.accountNumber}</span>
                        <button 
                          type="button" 
                          className={`pay-copy-btn ${copiedKey === 'account' ? 'copied' : ''}`}
                          onClick={() => handleCopyText(activeBankInfo.accountNumber, 'account')}
                        >
                          {copiedKey === 'account' ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === 'account' ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Số tiền cần chuyển</div>
                      <div className="pay-copy-row">
                        <span className="pay-qr-row-val big">{formatPrice(finalTotalAmount)}</span>
                        <button 
                          type="button" 
                          className={`pay-copy-btn ${copiedKey === 'amount' ? 'copied' : ''}`}
                          onClick={() => handleCopyText(Math.round(finalTotalAmount).toString(), 'amount')}
                        >
                          {copiedKey === 'amount' ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === 'amount' ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Nội dung chuyển khoản (Bắt buộc)</div>
                      <div className="pay-copy-row">
                        <span className="pay-qr-code-pill">{currentCode}</span>
                        <button 
                          type="button" 
                          className={`pay-copy-btn ${copiedKey === 'code' ? 'copied' : ''}`}
                          onClick={() => handleCopyText(currentCode, 'code')}
                        >
                          {copiedKey === 'code' ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === 'code' ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pay-qr-actions">
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleManualCheckPayment}
                      disabled={isCheckingPayment}
                      style={{ width: '100%', padding: '13px 18px', fontSize: '0.95rem' }}
                    >
                      {isCheckingPayment ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                      <span>{isCheckingPayment ? 'Đang kiểm tra giao dịch...' : 'Đã Chuyển Khoản — Kiểm Tra Ngay'}</span>
                    </button>
                    <p className="pay-note-hint">
                      Hệ thống tự động kích hoạt đơn hàng trong vài giây ngay khi nhận được thanh toán từ ngân hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MoMo QR Card */}
          {!isPaid && isMoMo && (
            <div className="pay-qr-card">
              <div className="pay-qr-header momo">
                <div className="pay-qr-brand">
                  <div className="pay-qr-brand-icon momo">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div className="pay-qr-brand-name">Thanh Toán Ví MoMo</div>
                    <div className="pay-qr-brand-sub">Quét bằng App MoMo hoặc App Ngân Hàng NAPAS</div>
                  </div>
                </div>

                <div className="pay-status-pill waiting">
                  <span className="pay-pulse" />
                  <span>Chờ thanh toán...</span>
                </div>
              </div>

              <div className="pay-qr-body">
                <div className="pay-qr-img-col">
                  <div className="pay-qr-frame momo-border">
                    <img 
                      src={momoData?.qrCodeUrl || `https://img.vietqr.io/image/970422-0988123456-compact2.png?amount=${finalTotalAmount}&addInfo=${currentCode}&accountName=MOMO%20SEN%20XINH%20GARDEN`} 
                      alt="Mã QR Thanh Toán MoMo" 
                      className="pay-qr-img" 
                    />
                  </div>
                  <div className="pay-qr-caption">Quét mã bằng Ví MoMo</div>
                </div>

                <div className="pay-qr-info">
                  <div className="pay-qr-grid-info">
                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Đơn vị thụ hưởng</div>
                      <div className="pay-qr-row-val">Nhà Vườn Sen Xinh Garden</div>
                    </div>

                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Số tiền cần thanh toán</div>
                      <div className="pay-qr-row-val big momo-color">{formatPrice(finalTotalAmount)}</div>
                    </div>

                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Mã giao dịch / Nội dung</div>
                      <div className="pay-copy-row">
                        <span className="pay-qr-code-pill momo">{currentCode}</span>
                        <button 
                          type="button" 
                          className={`pay-copy-btn ${copiedKey === 'momoCode' ? 'copied' : ''}`}
                          onClick={() => handleCopyText(currentCode, 'momoCode')}
                        >
                          {copiedKey === 'momoCode' ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedKey === 'momoCode' ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {momoData?.payUrl && (
                    <a 
                      href={momoData.payUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pay-open-momo"
                    >
                      <ExternalLink size={16} />
                      <span>Mở Cổng Thanh Toán MoMo (App / Web)</span>
                    </a>
                  )}

                  <div className="pay-qr-actions">
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleManualCheckPayment}
                      disabled={isCheckingPayment}
                      style={{ width: '100%', padding: '13px 18px', fontSize: '0.95rem', background: '#A50064', borderColor: '#A50064' }}
                    >
                      {isCheckingPayment ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                      <span>{isCheckingPayment ? 'Đang kiểm tra...' : 'Đã Thanh Toán — Kiểm Tra Ngay'}</span>
                    </button>
                    <p className="pay-note-hint">
                      Đơn hàng sẽ tự động cập nhật ngay sau khi bạn hoàn tất giao dịch trên MoMo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COD Card */}
          {currentPaymentMethod === 'cod' && (
            <div className="pay-cod-card">
              <div className="pay-cod-icon">
                <Truck size={32} color="#fff" />
              </div>
              <h3>Thanh Toán Tiền Mặt Khi Nhận Hàng (COD)</h3>
              <p>
                Đơn hàng của bạn sẽ được nhân viên bưu tá giao tận nơi. Bạn có thể kiểm tra cây sen đá trước khi thanh toán số tiền <strong>{formatPrice(finalTotalAmount)}</strong> cho shipper nhé!
              </p>
              <div className="pay-cod-steps">
                <div className="pay-cod-step">
                  <div className="pay-cod-step-dot">1</div>
                  <span>Đóng gói bảo vệ cây</span>
                </div>
                <span className="pay-cod-arrow">→</span>
                <div className="pay-cod-step">
                  <div className="pay-cod-step-dot">2</div>
                  <span>Giao hàng (2-4 ngày)</span>
                </div>
                <span className="pay-cod-arrow">→</span>
                <div className="pay-cod-step">
                  <div className="pay-cod-step-dot">3</div>
                  <span>Kiểm tra cây & Nhận</span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pay-actions">
            <button className="btn-primary" onClick={onNavigateShop}>
              <ShoppingBag size={18} />
              <span>Tiếp Tục Mua Sắm</span>
            </button>

            {isAdmin ? (
              <button className="btn-secondary" onClick={onNavigateAdmin}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span>Xem Trang Quản Trị</span>
              </button>
            ) : (
              <button
                className="btn-secondary"
                onClick={() => navigate('/account', { state: { tab: 'orders' } })}
              >
                <Package size={18} color="var(--primary)" />
                <span>Xem Đơn Hàng Của Tôi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Screen 2: Empty Cart in Checkout
  // =========================================================================
  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="chk-page">
        <div className="chk-empty">
          <ShoppingBag size={56} style={{ color: 'var(--moss)', opacity: 0.35, marginBottom: '16px' }} />
          <h2>Không có sản phẩm nào để thanh toán</h2>
          <p>
            Chưa có sản phẩm nào được chọn. Hãy ghé thăm vườn để lựa chọn những chậu sen đá xinh xắn nhé!
          </p>
          <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '12px 24px' }}>
            <span>Xem Cửa Hàng</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Screen 3: Simplified Checkout Form
  // =========================================================================
  return (
    <>
      <div className="chk-page">
        {/* Simple Top Navigation Header */}
        <div className="chk-simple-header">
          <div className="container">
            <button
              type="button"
              className="chk-back-btn"
              onClick={isDirectBuy ? () => navigate(-1) : onNavigateCart}
            >
              <ArrowLeft size={16} />
              <span>{isDirectBuy ? 'Quay lại chọn sản phẩm' : 'Quay lại giỏ hàng'}</span>
            </button>
          </div>
        </div>

        <div className="container" style={{ padding: '24px 20px 80px' }}>
          {/* Page Title */}
          <div className="chk-title-section">
            <h1 className="chk-page-title">Thanh Toán Đơn Hàng</h1>
            <p className="chk-page-desc">Vui lòng điền thông tin giao hàng và chọn phương thức thanh toán</p>
          </div>

          <form onSubmit={handleSubmitOrder} className="chk-layout">
            {/* Left Column: Delivery Info & Payment Method */}
            <div className="chk-main-col">
              {/* Guest Checkout Notice Banner */}
              {!user && (
                <div className="chk-guest-banner">
                  <div className="chk-guest-banner-left">
                    <Sparkles size={16} color="var(--primary)" />
                    <span>Mua nhanh không cần tạo tài khoản.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="chk-guest-login-btn"
                  >
                    Đăng nhập để tự động điền
                  </button>
                </div>
              )}

              {/* Section 1: Customer Details */}
              <div className="chk-card">
                <div className="chk-card-head">
                  <h2 className="chk-card-title">
                    Thông Tin Nhận Hàng
                    {user?.name && <span className="chk-autofill-badge">✓ Đã điền sẵn</span>}
                  </h2>
                </div>

                <div className="chk-form-grid">
                  <div className="chk-form-group">
                    <label className="chk-form-label">Họ và tên người nhận <span>*</span></label>
                    <input
                      type="text"
                      required
                      className="chk-form-input"
                      placeholder="Nguyễn Văn An"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="chk-form-group">
                    <label className="chk-form-label">Số điện thoại liên hệ <span>*</span></label>
                    <input
                      type="tel"
                      required
                      className="chk-form-input"
                      placeholder="0988 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="chk-form-group full">
                    <label className="chk-form-label">Tỉnh / Thành phố</label>
                    <select
                      className="chk-form-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      {(shippingConfig?.provinceRates || []).map((r) => (
                        <option key={r.id || r.province} value={r.province}>
                          {r.province} ({formatPrice(r.fee)})
                        </option>
                      ))}
                      {formData.city && !(shippingConfig?.provinceRates || []).some(r => r.province.toLowerCase() === formData.city.toLowerCase()) && (
                        <option value={formData.city}>{formData.city} ({formatPrice(shippingConfig?.defaultShippingFee || 35000)})</option>
                      )}
                    </select>
                  </div>

                  <div className="chk-form-group full">
                    <label className="chk-form-label">Địa chỉ nhận hàng chi tiết <span>*</span></label>
                    <input
                      type="text"
                      required
                      className="chk-form-input"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="chk-form-group full">
                    <label className="chk-form-label">Ghi chú giao hàng (Tùy chọn)</label>
                    <input
                      type="text"
                      className="chk-form-input"
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="chk-card">
                <div className="chk-card-head">
                  <h2 className="chk-card-title">Phương Thức Thanh Toán</h2>
                </div>

                <div className="chk-pay-options">
                  {/* VietQR Option */}
                  <label className={`chk-pay-card ${formData.paymentMethod === 'vietqr' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vietqr"
                      checked={formData.paymentMethod === 'vietqr'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'vietqr' })}
                    />
                    <div className="chk-pay-icon vqr">
                      <QrCode size={22} />
                    </div>
                    <div className="chk-pay-body">
                      <div className="chk-pay-name">
                        <span>Chuyển Khoản Ngân Hàng (VietQR)</span>
                        <span className="chk-pay-badge-rec">Nhanh & Tiện</span>
                      </div>
                      <p className="chk-pay-desc">
                        Quét mã QR bằng App Ngân Hàng bất kỳ. Hệ thống tự động xác nhận 24/7.
                      </p>
                    </div>
                    <div className="chk-radio-dot" />
                  </label>

                  {/* MoMo Option */}
                  <label className={`chk-pay-card ${formData.paymentMethod === 'momo' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={formData.paymentMethod === 'momo'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'momo' })}
                    />
                    <div className="chk-pay-icon momo">
                      <Smartphone size={22} />
                    </div>
                    <div className="chk-pay-body">
                      <div className="chk-pay-name">
                        <span>Ví Điện Tử MoMo</span>
                      </div>
                      <p className="chk-pay-desc">
                        Quét mã MoMo hoặc mở ứng dụng MoMo để hoàn tất thanh toán.
                      </p>
                    </div>
                    <div className="chk-radio-dot" />
                  </label>

                  {/* COD Option */}
                  <label className={`chk-pay-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    />
                    <div className="chk-pay-icon cod">
                      <Truck size={22} />
                    </div>
                    <div className="chk-pay-body">
                      <div className="chk-pay-name">
                        <span>Thanh Toán Khi Nhận Hàng (COD)</span>
                      </div>
                      <p className="chk-pay-desc">
                        Kiểm tra cây sen đá tươi khỏe khi nhận rồi mới thanh toán tiền mặt cho shipper.
                      </p>
                    </div>
                    <div className="chk-radio-dot" />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review Summary */}
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
                    <span>Phí vận chuyển ({formData.city || 'Khu vực'})</span>
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
          </form>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal {...modalProps} />
    </>
  );
}
