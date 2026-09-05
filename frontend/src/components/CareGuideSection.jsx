import React from 'react';
import { Droplets, Sun, Sprout, ShieldAlert, Sparkles } from 'lucide-react';
import { CARE_GUIDES } from '../data/products';

const ICONS = [Droplets, Sun, Sprout, ShieldAlert];

export default function CareGuideSection() {
  return (
    <section id="care" className="care-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Bí Quyết Từ Nhà Vườn</span>
          <h2 className="section-title">4 Nguyên Tắc Vàng Chăm Sóc Sen Đá</h2>
          <p className="section-desc">
            Sen đá rất dễ sống và bền bỉ nếu bạn nắm vững 4 yếu tố cốt lõi: Nước - Nắng - Đất - Gió.
          </p>
        </div>

        <div className="care-grid">
          {CARE_GUIDES.map((guide, idx) => {
            const IconComp = ICONS[idx] || Sparkles;

            return (
              <div key={guide.id} className="care-card">
                <div className="care-icon-wrap">
                  <IconComp size={26} />
                </div>
                <h3>{guide.title}</h3>
                <div className="care-summary">{guide.summary}</div>
                <p className="care-content">{guide.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
