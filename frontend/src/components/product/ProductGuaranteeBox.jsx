import React from 'react';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function ProductGuaranteeBox() {
  return (
    <div className="detail-guarantees">
      <div className="guarantee-box">
        <ShieldCheck size={24} color="var(--primary)" />
        <div>
          <strong>Bảo Hành 7 Ngày</strong>
          <p>1 đổi 1 nếu cây úng hoặc suy yếu</p>
        </div>
      </div>

      <div className="guarantee-box">
        <Truck size={24} color="var(--primary)" />
        <div>
          <strong>Đóng Gói Chống Sốc</strong>
          <p>Bọc bông gòn nhiều lớp an toàn</p>
        </div>
      </div>

      <div className="guarantee-box">
        <Sparkles size={24} color="var(--primary)" />
        <div>
          <strong>Cây Thuần Dưỡng</strong>
          <p>Rễ khỏe, thích ứng ngay tại nhà</p>
        </div>
      </div>
    </div>
  );
}
