import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle2,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Package,
  Calendar,
  CreditCard,
  Search
} from 'lucide-react';
import { formatPrice, formatDateTime } from './accountConstants';
import Pagination from '../Pagination';

export default function AccountPurchaseHistoryTab({
  orders = [],
  ordersLoading = false,
  onAddToCart,
  onNavigateShop,
  onNavigateCart,
  onOpenProductDetail,
  onOpenReturnModal,
  onNavigateOrders,
  addToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reorderingId, setReorderingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Lọc danh sách các đơn hàng đã hoàn tất giao hàng hoặc đã từng mua thành công
  const completedOrders = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'RETURNED' || o.status === 'RETURN_REQUESTED'
  );

  // Tổng hợp các chỉ số thống kê mua sắm
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPlantsBought = completedOrders.reduce((sum, o) => {
    const itemsCount = (o.items || []).reduce((iSum, it) => iSum + (it.quantity || 1), 0);
    return sum + itemsCount;
  }, 0);

  // Lọc theo từ khóa tìm kiếm (mã đơn hoặc tên cây)
  const filteredOrders = completedOrders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const matchCode = (order.orderCode || String(order.id)).toLowerCase().includes(term);
    const matchItems = (order.items || []).some((it) =>
      (it.productName || it.name || '').toLowerCase().includes(term)
    );
    return matchCode || matchItems;
  });

  // Tự động về trang 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const pagedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Xử lý "Mua Lại Cả Đơn" (Re-order): thêm toàn bộ sản phẩm của đơn vào giỏ hàng
  const handleReorderAll = (order) => {
    if (!order.items || order.items.length === 0) return;
    setReorderingId(order.id);

    try {
      let count = 0;
      order.items.forEach((it) => {
        if (onAddToCart) {
          onAddToCart(
            {
              id: it.productId || it.id,
              name: it.productName || it.name,
              price: it.price,
              image: it.image,
              inStock: it.inStock ?? 999
            },
            it.quantity || 1,
            false
          );
          count += it.quantity || 1;
        }
      });

      if (addToast) {
        addToast(`Đã thêm ${count} chậu cây từ đơn #${order.orderCode || order.id} vào giỏ hàng!`, 'cart');
      }

      if (onNavigateCart) {
        onNavigateCart();
      }
    } finally {
      setReorderingId(null);
    }
  };

  // Xử lý "Mua Lại" 1 sản phẩm đơn lẻ
  const handleReorderSingleItem = (item) => {
    if (onAddToCart) {
      onAddToCart(
        {
          id: item.productId || item.id,
          name: item.productName || item.name,
          price: item.price,
          image: item.image,
          inStock: item.inStock ?? 999
        },
        1,
        true
      );
    }
  };

  return (
    <div className="account-tab-content">
      <div className="account-card">
        {/* Card Header */}
        <div className="account-card-header" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Lịch Sử Mua Hàng Đã Giao</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              Danh mục các đơn hàng đã nhận thành công, bảo hành đổi trả 7 ngày và hỗ trợ đặt mua lại nhanh chóng
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={onNavigateShop}
              style={{ padding: '8px 16px', fontSize: '0.86rem' }}
            >
              <ShoppingBag size={15} />
              <span>Khám Phá Thêm Cây</span>
            </button>
            {onNavigateOrders && (
              <button
                className="btn-primary"
                onClick={onNavigateOrders}
                style={{ padding: '8px 16px', fontSize: '0.86rem' }}
              >
                <Package size={15} />
                <span>Theo Dõi Đơn Đang Giao</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Metrics */}
        <div className="order-stats-grid" style={{ marginBottom: '24px' }}>
          <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0', minWidth: 0 }}>
            <span style={{ fontSize: '0.8rem', color: '#047857', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Đơn Mua Thành Công
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#059669' }}>{completedOrders.length}</strong>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', minWidth: 0 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Tổng Tiền Tích Lũy
            </span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{formatPrice(totalSpent)}</strong>
          </div>

          <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE', minWidth: 0 }}>
            <span style={{ fontSize: '0.8rem', color: '#1D4ED8', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Cây Xanh Đã Sở Hữu
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#2563EB' }}>{totalPlantsBought} cây</strong>
          </div>

          <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A', minWidth: 0 }}>
            <span style={{ fontSize: '0.8rem', color: '#B45309', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Điểm Sen Tích Lũy
            </span>
            <strong style={{ fontSize: '1.5rem', color: '#D97706' }}>+{Math.floor(totalSpent / 10000)} pts</strong>
          </div>
        </div>

        {/* Search Bar if has completed orders */}
        {completedOrders.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn hàng hoặc tên sen đá đã mua..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', background: '#fff' }}
            />
          </div>
        )}

        {/* Orders List / Empty State */}
        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <History size={32} className="spin" style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử mua hàng của bạn...</p>
          </div>
        ) : completedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
            <History size={48} style={{ opacity: 0.35, color: 'var(--primary)', marginBottom: '16px' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Chưa Có Đơn Hàng Nào Hoàn Tất</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              Khi các đơn hàng của bạn được nhân viên giao thành công hoặc bạn bấm xác nhận đã nhận hàng, toàn bộ lịch sử mua sắm, hóa đơn và tính năng mua lại nhanh sẽ xuất hiện tại đây!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {onNavigateOrders && (
                <button className="btn-secondary" onClick={onNavigateOrders} style={{ padding: '10px 22px' }}>
                  <Package size={16} />
                  <span>Kiểm Tra Đơn Đang Giao</span>
                </button>
              )}
              <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '10px 24px' }}>
                <Sparkles size={16} />
                <span>Khám Phá Cây Mới</span>
              </button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Không tìm thấy đơn hàng nào khớp với từ khóa "<strong>{searchTerm}</strong>".
            </p>
            <button
              className="btn-secondary"
              onClick={() => setSearchTerm('')}
              style={{ marginTop: '12px', padding: '6px 16px', fontSize: '0.84rem' }}
            >
              Xóa Bộ Lọc Tìm Kiếm
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {pagedOrders.map((order) => {
              // Kiểm tra hạn bảo hành 7 ngày
              const completedDate = order.completedAt ? new Date(order.completedAt) : (order.createdAt ? new Date(order.createdAt) : new Date());
              const diffDays = Math.floor((new Date() - completedDate) / (1000 * 60 * 60 * 24));
              const remainingDays = Math.max(0, 7 - diffDays);
              const canReturn = diffDays <= 7 && order.status === 'COMPLETED';

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    minWidth: 0,
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Order Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                        #{order.orderCode || order.id}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {order.completedAt ? formatDateTime(order.completedAt) : (order.createdAt ? formatDateTime(order.createdAt) : 'Gần đây')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: order.status === 'RETURNED' ? '#F1F5F9' : '#DCFCE7',
                          color: order.status === 'RETURNED' ? '#475569' : '#059669',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        {order.status === 'RETURNED' ? 'Đã Hoàn Trả' : (order.status === 'RETURN_REQUESTED' ? 'Chờ Duyệt Hoàn Trả' : 'Giao Hàng Thành Công')}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(order.items || []).map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                          padding: '8px 0',
                          borderBottom: idx < order.items.length - 1 ? '1px dashed var(--border-light)' : 'none'
                        }}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', flex: 1, minWidth: '220px' }}
                          onClick={() => onOpenProductDetail && onOpenProductDetail(it.productId || it.id)}
                          title="Bấm để xem thông tin chi tiết cây"
                        >
                          <img
                            src={it.image || 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=120&q=80'}
                            alt={it.productName || it.name}
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                          />
                          <div>
                            <h5 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              {it.productName || it.name}
                            </h5>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              Số lượng: <strong>x{it.quantity || 1}</strong> • Đơn giá: {formatPrice(it.price)}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.95rem', minWidth: '80px', textAlign: 'right' }}>
                            {formatPrice((it.price || 0) * (it.quantity || 1))}
                          </strong>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => handleReorderSingleItem(it)}
                            style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Thêm cây này vào giỏ hàng"
                          >
                            <ShoppingBag size={13} />
                            <span>Mua Lại Cây Này</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer with Summary and Actions */}
                  <div
                    style={{
                      background: 'var(--bg-main)',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={14} />
                        Thanh toán: <strong>{
                          order.paymentMethod?.toLowerCase() === 'vietqr' ? 'Chuyển khoản VietQR' :
                          order.paymentMethod?.toLowerCase() === 'momo' ? 'Ví điện tử MoMo' :
                          'Tiền mặt khi nhận (COD)'
                        }</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'block' }}>Tổng đã thanh toán</span>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                          {formatPrice(order.totalAmount)}
                        </strong>
                      </div>

                      {canReturn && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onOpenReturnModal && onOpenReturnModal(order)}
                          style={{
                            padding: '7px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#059669',
                            borderColor: '#A7F3D0',
                            background: '#F0FDF4',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Yêu cầu đổi trả cây trong hạn 7 ngày"
                        >
                          <RotateCcw size={13} />
                          <span>Đổi Trả ({remainingDays > 0 ? `Còn ${remainingDays} ngày` : 'Hôm nay'})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleReorderAll(order)}
                        disabled={reorderingId === order.id}
                        style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        title="Thêm tất cả các chậu sen đá trong đơn này vào giỏ hàng"
                      >
                        <ShoppingBag size={14} />
                        <span>{reorderingId === order.id ? 'Đang Thêm...' : 'Mua Lại Cả Đơn'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Phân Trang (Pagination) */}
            {filteredOrders.length > itemsPerPage && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredOrders.length}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                />
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hoàn tất
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
