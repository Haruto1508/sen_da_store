import React from 'react';
import { QrCode, Truck } from 'lucide-react';

export default function CheckoutPaymentMethods({ paymentMethod, onSelectMethod }) {
  return (
    <div className="chk-card">
      <div className="chk-card-head">
        <h2 className="chk-card-title">Phương Thức Thanh Toán</h2>
      </div>

      <div className="chk-pay-options">
        {/* VietQR Option */}
        <label className={`chk-pay-card ${paymentMethod === 'vietqr' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="vietqr"
            checked={paymentMethod === 'vietqr'}
            onChange={() => onSelectMethod('vietqr')}
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

        {/* COD Option */}
        <label className={`chk-pay-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={() => onSelectMethod('cod')}
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
  );
}
