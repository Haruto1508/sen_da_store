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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Tổng Doanh Thu</span>
          <TrendingUp size={16} color="var(--primary)" />
        </div>
        <strong style={{ fontSize: '1.45rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>
          {formatPrice(stats.totalRevenue)}
        </strong>
      </div>

      <div
        style={{
          background: '#FFFBEB',
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #FDE68A'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#B45309' }}>Đơn Chờ Thanh Toán</span>
          <Clock size={16} color="#D97706" />
        </div>
        <strong style={{ fontSize: '1.6rem', color: '#D97706', display: 'block', marginTop: '4px' }}>
          {stats.pendingOrders}
        </strong>
      </div>

      <div
        style={{
          background: '#ECFDF5',
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #A7F3D0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#047857' }}>Đơn Đã Xử Lý / Xong</span>
          <CheckCircle2 size={16} color="#059669" />
        </div>
        <strong style={{ fontSize: '1.6rem', color: '#059669', display: 'block', marginTop: '4px' }}>
          {(stats.paidOrders || 0) + (stats.completedOrders || 0)}
        </strong>
      </div>

      <div
        style={{
          background: '#EFF6FF',
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #BFDBFE'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#1D4ED8' }}>Sen Đá Trong Kho</span>
          <Sprout size={16} color="#2563EB" />
        </div>
        <strong style={{ fontSize: '1.6rem', color: '#1D4ED8', display: 'block', marginTop: '4px' }}>
          {stats.totalProducts || productsCount || 0}
        </strong>
      </div>

      <div
        style={{
          background: '#FAF5FF',
          padding: '18px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #E9D5FF'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#7E22CE' }}>Thành Viên Đăng Ký</span>
          <Users size={16} color="#9333EA" />
        </div>
        <strong style={{ fontSize: '1.6rem', color: '#7E22CE', display: 'block', marginTop: '4px' }}>
          {stats.totalCustomers || customersCount || 0}
        </strong>
      </div>
    </div>
  );
}
