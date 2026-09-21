import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, CheckCircle2, Sparkles, Calendar, User } from 'lucide-react';
import { getProductReviews } from '../../services/api';

export default function ProductReviewsModal({ product, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) return;
    setLoading(true);
    getProductReviews(product.id)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch((err) => console.warn('Lỗi tải reviews trong admin:', err))
      .finally(() => setLoading(false));
  }, [product]);

  if (!product) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Gần đây';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Gần đây';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B'
            }}>
              <Star size={18} fill="currentColor" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Đánh Giá & Phản Hồi Khách Hàng</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {product.name} ({product.scientificName || 'Sen đá'})
              </p>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Product Rating Overview Banner */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-main)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-light)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {Number(product.rating || 5.0).toFixed(1)}
                </span>
                <div style={{ display: 'flex', gap: '2px', color: '#F59E0B' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= Math.round(Number(product.rating || 5)) ? '#F59E0B' : 'none'}
                      color="#F59E0B"
                    />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Tổng cộng <strong>{product.reviewsCount || reviews.length}</strong> lượt đánh giá
              </span>
            </div>
          </div>

          <span style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: (product.rating || 5) >= 4.5 ? '#D1FAE5' : '#FEF3C7',
            color: (product.rating || 5) >= 4.5 ? '#059669' : '#D97706'
          }}>
            {(product.rating || 5) >= 4.5 ? '⭐ Xếp hạng Xuất Sắc' : 'Đánh giá Tốt'}
          </span>
        </div>

        {/* Reviews List */}
        <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Đang tải nhận xét của khách hàng...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Sản phẩm này chưa có bình luận chi tiết nào từ khách hàng.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {rev.reviewerName || 'Khách yêu sen đá'}
                      </strong>
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#059669',
                        background: '#D1FAE5',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600
                      }}>
                        ✓ Khách mua
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '2px', color: '#F59E0B' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            fill={s <= (rev.rating || 5) ? '#F59E0B' : 'none'}
                            color="#F59E0B"
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-light)', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
