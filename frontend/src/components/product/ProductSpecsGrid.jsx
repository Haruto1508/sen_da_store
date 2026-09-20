import React from 'react';
import { Sun, Droplets, Maximize2, MapPin } from 'lucide-react';

export default function ProductSpecsGrid({ product }) {
  return (
    <div className="detail-specs-grid">
      <div className="spec-card">
        <div className="spec-icon">
          <Sun size={18} />
        </div>
        <div className="spec-text">
          <label>Ánh Sáng Yêu Cầu</label>
          <span>{product.light}</span>
        </div>
      </div>

      <div className="spec-card">
        <div className="spec-icon">
          <Droplets size={18} />
        </div>
        <div className="spec-text">
          <label>Chu Kỳ Tưới Nước</label>
          <span>{product.watering}</span>
        </div>
      </div>

      <div className="spec-card">
        <div className="spec-icon">
          <Maximize2 size={18} />
        </div>
        <div className="spec-text">
          <label>Kích Thước Cây</label>
          <span>{product.size}</span>
        </div>
      </div>

      <div className="spec-card">
        <div className="spec-icon">
          <MapPin size={18} />
        </div>
        <div className="spec-text">
          <label>Vị Trí Đặt Lý Tưởng</label>
          <span>{product.idealLocation || 'Bàn làm việc, kệ sách'}</span>
        </div>
      </div>
    </div>
  );
}
