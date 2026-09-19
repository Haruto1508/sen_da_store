import React, { useMemo, useState } from 'react';
import {
  Search,
  PackageCheck,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Truck
} from 'lucide-react';
import Pagination from '../Pagination';
import { formatPrice } from './adminConstants';

export default function DeliveredOrdersTab({
  orders = [],
  onOpenOrderDetail,
  onOpenCustomerOrders
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState('');
  const itemsPerPage = 8;

  // Lọc riêng các đơn hàng có trạng thái COMPLETED (Đã giao thành công)
  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'COMPLETED');
  }, [orders]);

  // Tìm kiếm trong danh sách đơn đã giao
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return deliveredOrders;
    const q = searchQuery.toLowerCase().trim();
    return deliveredOrders.filter(
      (o) =>
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.customerAddress && o.customerAddress.toLowerCase().includes(q))
    );
  }, [deliveredOrders, searchQuery]);

  // Thống kê nhanh
  const totalDeliveredRevenue = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [deliveredOrders]);

  const deliverySuccessRate = useMemo(() => {
    if (!orders.length) return 100;
    return Math.round((deliveredOrders.length / orders.length) * 100);
  }, [orders, deliveredOrders]);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const pagedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-tab-content">
      {/* 1. Header KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-light, #E2E8F0)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>Đơn Đã Giao Thành Công</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>{deliveredOrders.length} <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>đơn</span></div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-light, #E2E8F0)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>Doanh Thu Đã Thu Về</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E40AF', marginTop: '2px' }}>{formatPrice(totalDeliveredRevenue)}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-light, #E2E8F0)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>Tỷ Lệ Giao Thành Công</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#92400E', marginTop: '2px' }}>{deliverySuccessRate}% <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>trên tổng đơn</span></div>
          </div>
        </div>
      </div>

      {/* 2. Toolbar & Search */}
      <div className="admin-toolbar" style={{ marginBottom: '16px' }}>
        <div className="admin-search-wrapper" style={{ maxWidth: '440px' }}>
          <Search size={16} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm theo mã đơn (#SX...), tên khách, số điện thoại..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Đã lọc:</span>
          <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: 'var(--radius-full, 9999px)', fontWeight: 700 }}>
            {filteredOrders.length} đơn hoàn tất
          </span>
        </div>
      </div>

      {/* 3. Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="admin-empty-state" style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed var(--border-light, #CBD5E1)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <PackageCheck size={32} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>
            {searchQuery ? 'Không tìm thấy đơn đã giao phù hợp' : 'Chưa có đơn hàng nào được giao thành công'}
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            {searchQuery ? 'Hãy thử tìm kiếm với từ khóa khác như mã đơn hoặc số điện thoại.' : 'Khi khách hàng nhận được cây sen đá hoặc admin cập nhật trạng thái "Hoàn tất", đơn hàng sẽ hiển thị tại đây.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {pagedOrders.map((order) => (
            <div
              key={order.id || order.orderCode}
              className="admin-order-card"
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid var(--border-light, #E2E8F0)',
                padding: '18px 22px',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    #{order.orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(order.orderCode, e)}
                    style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                    title="Sao chép mã đơn"
                  >
                    {copiedCode === order.orderCode ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  </button>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                    <CheckCircle2 size={13} />
                    Giao Thành Công
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} />
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Vừa xong'}
                  </span>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onOpenOrderDetail && onOpenOrderDetail(order, 'tabs')}
                    style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <span>Chi Tiết</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Customer Info */}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Người Nhận Hàng
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {order.customerName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Phone size={14} />
                    {order.customerPhone}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{order.customerAddress}</span>
                  </div>
                </div>

                {/* Products Summary */}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Sản Phẩm Đã Giao ({order.items?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(order.items || []).map((it, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          color: '#334155',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ShoppingBag size={12} color="var(--primary)" />
                        <strong>{it.productName || it.name}</strong>
                        <span style={{ color: '#64748B' }}>x{it.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Payment & Amount */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Tổng Thanh Toán
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary, #2D5A3F)' }}>
                    {formatPrice(order.totalAmount)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                    <CreditCard size={13} />
                    {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển Khoản VietQR' : (order.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'Tiền Mặt (COD)')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
