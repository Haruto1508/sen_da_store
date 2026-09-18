import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Sprout,
  Users
} from 'lucide-react';

export default function AdminStatsCards({ stats, productsCount, customersCount }) {
  if (!stats) return null;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const cards = [
    {
      id: 'revenue',
      title: 'Tổng Doanh Thu',
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      accent: 'var(--primary)',
      bg: '#FFFFFF',
      border: '1px solid var(--border-light)',
      iconBg: 'rgba(45, 90, 63, 0.1)',
      iconColor: 'var(--primary)',
      sub: `${stats.totalOrders || 0} đơn hàng tổng cộng`
    },
    {
      id: 'pending',
      title: 'Chờ Thanh Toán',
      value: stats.pendingOrders || 0,
      icon: Clock,
      accent: '#D97706',
      bg: '#FFFFFF',
      border: '1px solid #FDE68A',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      sub: 'Cần xác nhận / xử lý'
    },
    {
      id: 'completed',
      title: 'Đơn Đã Xử Lý / Giao',
      value: (stats.paidOrders || 0) + (stats.completedOrders || 0),
      icon: CheckCircle2,
      accent: '#059669',
      bg: '#FFFFFF',
      border: '1px solid #A7F3D0',
      iconBg: '#D1FAE5',
      iconColor: '#059669',
      sub: `${stats.completedOrders || 0} đơn giao thành công`
    },
    {
      id: 'products',
      title: 'Sen Đá Trong Kho',
      value: stats.totalProducts || productsCount || 0,
      icon: Sprout,
      accent: '#2563EB',
      bg: '#FFFFFF',
      border: '1px solid #BFDBFE',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
      sub: 'Đang mở bán trên shop'
    },
    {
      id: 'customers',
      title: 'Thành Viên Vườn',
      value: stats.totalCustomers || customersCount || 0,
      icon: Users,
      accent: '#7C3AED',
      bg: '#FFFFFF',
      border: '1px solid #E9D5FF',
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
      sub: 'Khách hàng đăng ký'
    }
  ];

  return (
    <div
      className="admin-stats-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '26px'
      }}
    >
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="admin-stat-card"
            style={{
              background: card.bg,
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              border: card.border,
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.title}
                </span>
                <strong
                  style={{
                    fontSize: card.id === 'revenue' ? '1.4rem' : '1.75rem',
                    color: card.accent,
                    display: 'block',
                    marginTop: '4px',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.2
                  }}
                >
                  {card.value}
                </strong>
              </div>

              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <IconComponent size={20} />
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '8px', marginTop: '4px' }}>
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}
