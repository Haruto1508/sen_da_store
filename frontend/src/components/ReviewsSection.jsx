import React from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';
import { TESTIMONIALS } from '../data/products';

export default function ReviewsSection() {
  return (
    <section id="reviews" className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Khách Hàng Nói Gì</span>
          <h2 className="section-title">Hơn 2,500+ Chậu Cây Đã Tìm Thấy Mái Nhà Mới</h2>
          <p className="section-desc">
            Cảm nhận chân thực từ những người yêu mầm xanh đã trải nghiệm dịch vụ tại Sen Xinh Garden.
          </p>
        </div>

        <div className="test-grid">
          {TESTIMONIALS.map((item) => (
            <div key={item.id} className="test-card">
              <div className="test-stars">
                {[...Array(item.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>

              <p className="test-comment">"{item.comment}"</p>

              <div className="test-author">
                <img src={item.avatar} alt={item.name} className="test-avatar" />
                <div className="test-author-info">
                  <h4>{item.name}</h4>
                  <p>{item.role} • Đã mua: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.product}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
