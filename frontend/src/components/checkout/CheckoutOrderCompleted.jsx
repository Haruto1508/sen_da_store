import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Smartphone,
  Truck,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ExternalLink,
  ShoppingBag,
  Package,
  ShieldCheck
} from 'lucide-react';

export default function CheckoutOrderCompleted({
  placedOrder,
  formData,
  orderStatus,
  finalTotalAmount,
  currentCode,
  formatPrice,
  activeBankInfo,
  vietQrUrl,
  momoData,
  copiedKey,
  handleCopyText,
  handleManualCheckPayment,
  isCheckingPayment,
  isAdmin,
  onNavigateShop,
  onNavigateAdmin,
  navigate
}) {
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
