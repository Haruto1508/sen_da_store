import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

export default function Hero({ onExploreCatalog, onOpenQuiz }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          {/* Left copy */}
          <div className="hero-content">
            <div className="hero-tag">
              <Sparkles size={16} />
              <span>Vườn Ươm Sen Đá Thuần Dưỡng Đà Lạt</span>
            </div>

            <h1 className="hero-title">
              Gieo một mầm xanh, <br />
              gặt <span>vạn an yên</span>
            </h1>

            <p className="hero-desc">
              Bộ sưu tập sen đá, xương rồng phong thủy và phụ kiện cây cảnh cao cấp. 
              Mỗi chậu cây đều được thuần dưỡng kỹ lưỡng, rễ khỏe, dễ chăm sóc và mang lại 
              năng lượng tươi mới cho bàn làm việc của bạn.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={onExploreCatalog}>
                <span>Khám Phá Cửa Hàng</span>
                <ArrowRight size={18} />
              </button>

              <button className="btn-secondary" onClick={onOpenQuiz}>
                <Sparkles size={18} color="var(--accent)" />
                <span>Trắc Nghiệm Chọn Cây</span>
              </button>
            </div>

            {/* Highlights */}
            <div className="hero-highlights">
              <div className="highlight-item">
                <div className="highlight-icon">
                  <ShieldCheck size={20} />
                </div>
                <div className="highlight-text">
                  <h4>Bảo Hành 7 Ngày</h4>
                  <p>1 đổi 1 nếu cây úng/suy yếu</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon">
                  <Truck size={20} />
                </div>
                <div className="highlight-text">
                  <h4>Đóng Gói Chống Sốc</h4>
                  <p>Giao an toàn toàn quốc</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon">
                  <HeartHandshake size={20} />
                </div>
                <div className="highlight-text">
                  <h4>Tư Vấn Trọn Đời</h4>
                  <p>Hỗ trợ kỹ thuật 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img 
                src="/hero-banner.jpg" 
                alt="Bộ sưu tập sen đá tại Sen Xinh Garden" 
                className="hero-img"
              />
            </div>

            {/* Floating rating badge */}
            <div className="floating-badge">
              <div className="floating-badge-icon">
                ★
              </div>
              <div className="floating-badge-text">
                <strong>4.9 / 5.0 Điểm Hài Lòng</strong>
                <span>Hơn 2,500+ khách hàng tin chọn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
