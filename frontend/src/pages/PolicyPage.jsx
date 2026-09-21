import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  CreditCard,
  PhoneCall,
  ShoppingBag,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function PolicyPage({ onNavigateHome, onNavigateShop, onNavigateAccount }) {
  const [activeTab, setActiveTab] = useState('return');

  const TABS = [
    {
      id: 'return',
      label: 'Đổi Trả & Hoàn Tiền 7 Ngày',
      icon: RotateCcw,
      badge: 'Cam Kết Vàng'
    },
    {
      id: 'warranty',
      label: 'Bảo Hành Sức Sống Cây',
      icon: ShieldCheck,
      badge: 'Trọn Đời'
    },
    {
      id: 'shipping',
      label: 'Đóng Gói & Vận Chuyển',
      icon: Truck,
      badge: '4 Lớp Chống Sốc'
    },
    {
      id: 'loyalty',
      label: 'Điểm Thưởng & Thu Hồi',
      icon: Sparkles,
      badge: 'Ưu Đãi'
    }
  ];

  return (
    <div className="policy-page" style={{ background: 'var(--bg-main)', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Page Header Banner */}
      <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%)', color: '#fff', padding: '48px 0 40px' }}>
        <div className="container">
          <div className="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', opacity: 0.85, marginBottom: '16px' }}>
            <button
              className="breadcrumb-link"
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Trang Chủ
            </button>
            <span>/</span>
            <span style={{ fontWeight: 600 }}>Chính Sách Cửa Hàng</span>
          </div>

          <div style={{ maxWidth: '780px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.18)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}>
              <ShieldCheck size={14} />
              CHÍNH SÁCH BẢO HÀNH & HỖ TRỢ KHÁCH HÀNG
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '12px' }}>
              Cam Kết Chất Lượng & Dịch Vụ Sen Xinh Garden
            </h1>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.9 }}>
              Mỗi chậu sen đá trao gửi đến bạn là tình yêu và tâm huyết của đội ngũ nghệ nhân vườn ươm. Chúng tôi cam kết bảo vệ quyền lợi tối đa cho bạn với chính sách đổi trả trong vòng 7 ngày và tư vấn chăm sóc trọn đời.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-24px' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          background: '#fff',
          padding: '12px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          marginBottom: '36px'
        }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: isActive ? '2px solid #059669' : '1px solid transparent',
                  background: isActive ? '#ECFDF5' : 'transparent',
                  color: isActive ? '#065F46' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: isActive ? '#059669' : '#F1F5F9',
                  color: isActive ? '#fff' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', lineHeight: 1.3 }}>{tab.label}</div>
                  <span style={{
                    fontSize: '0.72rem',
                    color: isActive ? '#059669' : '#94A3B8',
                    fontWeight: 600
                  }}>
                    {tab.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Chính sách hoàn trả 7 ngày */}
        {activeTab === 'return' && (
          <div className="policy-content-section" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Highlight Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: '1.5px solid #86EFAC',
              borderRadius: '16px',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '18px'
            }}>
              <div style={{
                background: '#16A34A',
                color: '#fff',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  Thời Hạn Đổi Trả Tiêu Chuẩn: 07 Ngày Kể Từ Khi Nhận Hàng
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#15803D', lineHeight: 1.6, margin: 0 }}>
                  Quý khách hoàn toàn an tâm khi mua cây tại Sen Xinh Garden! Nếu kiện hàng gặp bất kỳ sự cố dập nát, giao nhầm cây hoặc úng bệnh, quý khách chỉ cần gửi yêu cầu trực tuyến trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng. Đội ngũ sẽ hỗ trợ hoàn tiền hoặc đổi cây mới trong vòng 24 giờ làm việc.
                </p>
              </div>
            </div>

            {/* Conditions & Criteria */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {/* Accepted cases */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <CheckCircle2 size={22} color="#16A34A" />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    Trường Hợp Được Hỗ Trợ Đổi / Trả 100%
                  </h4>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                  {[
                    'Cây bị gãy cánh, dập nát hoặc thối rễ do quá trình vận chuyển đường dài.',
                    'Giao sai mã cây, sai kích cỡ hoặc thiếu sản phẩm so với đơn đặt hàng.',
                    'Cây có dấu hiệu sâu bệnh, rệp sáp hoặc úng thối ngay khi vừa khui hộp kiểm tra.',
                    'Chậu sứ, chậu gốm hoặc phụ kiện đi kèm bị vỡ nứt trong lúc giao vận.',
                    'Đơn hàng phát sinh lỗi từ kho đóng gói hoặc không đúng như ảnh đại diện cam kết.'
                  ].map((text, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                      <span style={{ color: '#16A34A', fontWeight: 'bold' }}>✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Accepted cases */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <AlertTriangle size={22} color="#DC2626" />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    Trường Hợp Không Thuộc Diện Đổi Trả
                  </h4>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                  {[
                    'Đơn hàng đã hoàn tất quá 7 ngày kể từ khi khách nhận kiện hàng thành công.',
                    'Cây bị úng hoặc cháy nắng do khách tưới nước ngập đẫm ngay khi mở hộp hoặc đem phơi nắng gắt đột ngột (không tuân theo tờ hướng dẫn xả bầu đi kèm).',
                    'Cây bị hư hại do rơi vỡ, thú cưng cắn xé sau khi đã bàn giao an toàn.',
                    'Khách hàng thay đổi ý định sở hữu sau khi cây đã được chăm sóc qua thời hạn đổi trả.',
                    'Các sản phẩm trong chương trình thanh lý xả vườn giảm giá từ 50% trở lên (có ghi chú không đổi trả).'
                  ].map((text, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#64748B', lineHeight: 1.5 }}>
                      <span style={{ color: '#DC2626', fontWeight: 'bold' }}>✗</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4-Step Return Process */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px 28px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', textAlign: 'center' }}>
                Quy Trình 4 Bước Đổi Trả Nhanh Chóng & Tiện Lợi
              </h4>
              <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.92rem', maxWidth: '600px', margin: '0 auto 32px' }}>
                Tất cả thao tác đều được thực hiện trực tiếp trên website Sen Xinh Garden mà không cần gọi điện hay thủ tục rườm rà.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '20px'
              }}>
                {[
                  {
                    step: '01',
                    title: 'Gửi Yêu Cầu Trực Tuyến',
                    desc: 'Vào Lịch Sử Đơn Hàng trong Tài khoản -> Chọn đơn đã giao -> Nhấn "Yêu Cầu Hoàn Trả".',
                    icon: FileText
                  },
                  {
                    step: '02',
                    title: 'Điền Lý Do & Số TK',
                    desc: 'Chọn lý do hư hỏng, mô tả chi tiết và nhập số tài khoản ngân hàng để nhận tiền hoàn.',
                    icon: CreditCard
                  },
                  {
                    step: '03',
                    title: 'Sen Xinh Xác Thực 24h',
                    desc: 'Nhân viên chăm sóc kiểm tra thông tin, duyệt yêu cầu và gửi thông báo xác nhận tự động.',
                    icon: ShieldCheck
                  },
                  {
                    step: '04',
                    title: 'Hoàn Tiền & Hoàn Kho',
                    desc: 'Tiền được chuyển khoản ngay vào STK của bạn, hệ thống tự động hoàn lại số lượng cây vào kho.',
                    icon: RotateCcw
                  }
                ].map((item, idx) => {
                  const StepIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        borderRadius: '14px',
                        padding: '22px',
                        border: '1px solid #E2E8F0',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '18px',
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: '#CBD5E1',
                        fontFamily: 'monospace'
                      }}>
                        {item.step}
                      </div>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#059669',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '14px'
                      }}>
                        <StepIcon size={20} />
                      </div>
                      <h5 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                        {item.title}
                      </h5>
                      <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bảo hành cây sống */}
        {activeTab === 'warranty' && (
          <div className="policy-content-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <ShieldCheck size={28} color="#059669" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Cam Kết Cây Sống Khỏe & Thuần Nắng Vườn Đà Lạt
                </h3>
              </div>
              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
                100% các dòng sen đá và xương rồng tại Sen Xinh Garden đều được dưỡng xả ẩm, phơi nắng tự nhiên tại đèo Mimosa, Đà Lạt tối thiểu 3 tuần trước khi xuất vườn. Cây đã phát triển bộ rễ tơ chắc khỏe, chịu nhiệt tốt khi về các tỉnh thành miền Nam và miền Bắc.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>
                    🌿 Hỗ Trợ Kỹ Thuật 1-1 Trọn Đời
                  </h5>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                    Bạn chỉ cần chụp ảnh tình trạng lá, rễ gửi qua Zalo 0988.123.456, chuyên viên làm vườn sẽ tư vấn cách cứu cây, phối trộn giá thể và xử lý nấm bệnh miễn phí trọn đời.
                  </p>
                </div>
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>
                    📜 Tặng Kèm Cẩm Nang Hướng Dẫn
                  </h5>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                    Mỗi đơn hàng đều đi kèm phiếu hướng dẫn 3 bước "Xả bầu - Trồng lại - Thuần nắng" được biên soạn chi tiết và dễ hiểu dành riêng cho người mới bắt đầu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Đóng gói & Vận chuyển */}
        {activeTab === 'shipping' && (
          <div className="policy-content-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Truck size={28} color="#2563EB" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Quy Chuẩn Đóng Gói 4 Lớp Chống Sốc Chuyên Nghiệp
                </h3>
              </div>
              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.7, marginBottom: '24px' }}>
                Cây mọng nước rất nhạy cảm với ẩm ướt và va chạm trong thùng kín. Do đó, Sen Xinh áp dụng quy chuẩn đóng gói chuyên biệt dành riêng cho cây cảnh xuất khẩu:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {[
                  { title: 'Lớp 1: Xả Đất Khô Ráo', desc: 'Bầu rễ được phơi ráo trước khi bọc để tránh tình trạng hầm hơi, úng lá trong quá trình vận chuyển 2-4 ngày.' },
                  { title: 'Lớp 2: Giấy Mềm Thấm Hút', desc: 'Từng cánh sen đá được chèn lớp giấy chuyên dụng mềm mại nhằm cố định dáng đài hoa, ngăn va chạm xước phấn.' },
                  { title: 'Lớp 3: Túi Khí Chống Sốc', desc: 'Bọc lớp màng bóng khí đàn hồi quanh chậu và bầu cây giúp hấp thụ 98% lực va đập khi qua bưu cục trung chuyển.' },
                  { title: 'Lớp 4: Thùng Carton Định Vị', desc: 'Đóng thùng carton 3-5 lớp cứng cáp, cố định gốc cây và dán nhãn "Hàng Cây Cảnh Dễ Vỡ - Xin Nhẹ Tay".' }
                ].map((c, i) => (
                  <div key={i} style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2563EB', marginBottom: '6px' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
                      {c.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Điểm thưởng & Thu hồi */}
        {activeTab === 'loyalty' && (
          <div className="policy-content-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Sparkles size={28} color="#D97706" />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Chính Sách Tích Lũy & Thu Hồi Điểm Sen Thưởng
                </h3>
              </div>
              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.7, marginBottom: '20px' }}>
                Chương trình Điểm Sen tri ân khách hàng thân thiết được quản lý minh bạch và công bằng:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '18px 22px', borderRadius: '12px' }}>
                  <strong style={{ color: '#B45309', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>
                    🌟 Tỷ lệ tích lũy khi mua hàng:
                  </strong>
                  <span style={{ fontSize: '0.9rem', color: '#92400E' }}>
                    Mỗi 10.000đ giá trị thanh toán sẽ nhận được <strong>1 Điểm Sen</strong> khi đơn hàng được giao thành công (`COMPLETED`). Điểm tích lũy có thể quy đổi thành mã giảm giá trực tiếp vào lần mua tiếp theo.
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '18px 22px', borderRadius: '12px' }}>
                  <strong style={{ color: '#475569', fontSize: '0.98rem', display: 'block', marginBottom: '4px' }}>
                    🔄 Quy tắc thu hồi khi đơn hàng được hoàn trả (`RETURNED`):
                  </strong>
                  <span style={{ fontSize: '0.9rem', color: '#64748B' }}>
                    Khi đơn hàng được xác nhận hoàn trả và hoàn tiền thành công, hệ thống sẽ tự động khấu trừ lại số Điểm Sen tương ứng đã cộng từ đơn hàng đó. Số dư điểm của khách hàng sẽ không bao giờ bị âm dưới 0 điểm.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA & Support Bar */}
        <div style={{
          marginTop: '40px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '16px',
          padding: '36px 32px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              Bạn Cần Hỗ Trợ Đổi Trả Ngay Hôm Nay?
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', margin: 0 }}>
              Truy cập vào lịch sử đơn hàng để tạo yêu cầu đổi trả, hoặc liên hệ trực tiếp vườn ươm qua Hotline.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={onNavigateAccount}
              style={{
                padding: '12px 22px',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Package size={16} />
              <span>Xem Đơn Hàng Của Tôi</span>
            </button>

            <button
              className="btn-secondary"
              onClick={onNavigateShop}
              style={{
                padding: '12px 22px',
                fontSize: '0.9rem',
                fontWeight: 700,
                background: 'transparent',
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShoppingBag size={16} />
              <span>Tiếp Tục Mua Sắm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
