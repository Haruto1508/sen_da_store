import React from 'react';
import { Truck } from 'lucide-react';

export default function CartFreeShippingBar({
  remainingForFreeShip,
  progressPercent,
  formatPrice
}) {
  return (
    <div className="cx-freeship">
      <div className="cx-freeship-top">
        <span className="cx-freeship-label">
          <Truck size={18} color="var(--primary)" />
          {remainingForFreeShip === 0 ? (
            <span>
              <strong>Tuyệt vời!</strong> Đơn hàng đủ điều kiện <strong>Miễn Phí Vận Chuyển</strong> toàn quốc!
            </span>
          ) : (
            <span>
              Mua thêm <strong style={{ color: 'var(--primary)' }}>{formatPrice(remainingForFreeShip)}</strong> để nhận <strong>Miễn Phí Giao Hàng</strong>!
            </span>
          )}
        </span>
        <span className="cx-freeship-pct">{progressPercent}%</span>
      </div>
      <div className="cx-freeship-bar">
        <div className="cx-freeship-fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}
