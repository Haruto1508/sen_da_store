import React from 'react';
import { Sprout, Phone, Mail, MapPin, Heart } from 'lucide-react';
import NotificationModal from './NotificationModal';
import useModal from './useModal';

export default function Footer() {
  const { modalProps, showModal } = useModal();

  return (
    <>
      <footer id="footer" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <h3>
              <Sprout size={24} color="var(--secondary)" />
              <span>Sen Xinh Garden</span>
            </h3>
            <p className="footer-desc">
              Tiệm cây mọng nước và không gian sống xanh. Chuyên cung cấp các dòng sen đá, 
              xương rồng thuần dưỡng khỏe mạnh, chậu gốm mộc thủ công và giải pháp quà tặng thiên nhiên.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--secondary)" />
                <span>Vườn ươm: Đèo Mimosa, Phường 10, TP. Đà Lạt</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--secondary)" />
                <span>Cửa hàng: 128 Hoàng Hoa Thám, Ba Đình, Hà Nội</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="var(--secondary)" />
                <span>Hotline / Zalo: 0988.123.456</span>
              </div>
            </div>
          </div>

          {/* Links 1 */}
          <div className="footer-links">
            <h4>Danh Mục Sản Phẩm</h4>
            <ul>
              <li><a href="#/shop">Sen Đài & Hoa Hồng</a></li>
              <li><a href="#/shop">Sen Mọng Nước Pha Lê</a></li>
              <li><a href="#/shop">Xương Rồng Phong Thủy</a></li>
              <li><a href="#/shop">Combo Quà Tặng</a></li>
              <li><a href="#/shop">Chậu Đất Nung & Giá Thể</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="footer-links">
            <h4>Chính Sách & Hỗ Trợ</h4>
            <ul>
              <li><a href="#/news">Chính sách bảo hành 7 ngày</a></li>
              <li><a href="#/news">Quy chuẩn đóng gói chống sốc</a></li>
              <li><a href="#/news">Hướng dẫn xả bầu & thuần nắng</a></li>
              <li><a href="#/news">Chính sách giao hàng toàn quốc</a></li>
              <li><a href="#/news">Câu hỏi thường gặp (FAQ)</a></li>
              <li><a href="#/admin" style={{ color: 'var(--secondary)', fontWeight: 600 }}>🌿 Quản trị nhà vườn (Admin)</a></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="footer-links">
            <h4>Nhận Ưu Đãi Mầm Xanh</h4>
            <p style={{ fontSize: '0.86rem', marginBottom: '14px' }}>
              Đăng ký để nhận cẩm nang chăm cây mùa mưa và mã giảm giá 10% cho đơn đầu tiên:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                style={{ 
                  flexGrow: 1, 
                  padding: '10px 14px', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }} 
              />
              <button 
                className="btn-primary" 
                style={{ padding: '10px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}
                onClick={() => showModal('success', 'Cảm ơn bạn đã đăng ký nhận bản tin mầm xanh! Chúng tôi sẽ gửi mã giảm giá 10% qua email của bạn sớm nhất.', 'Đăng ký thành công! 🌱')}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom">
          <span>© 2026 Sen Xinh Garden. Tất cả quyền được bảo lưu.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Thiết kế với tình yêu thiên nhiên <Heart size={14} color="#E63946" fill="#E63946" />
          </span>
        </div>
      </div>
    </footer>

    {/* Notification Modal – thay thế window.alert() */}
    <NotificationModal {...modalProps} />
    </>
  );
}
