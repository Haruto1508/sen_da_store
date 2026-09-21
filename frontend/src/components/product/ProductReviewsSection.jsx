import React, { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, CheckCircle2, Send, ThumbsUp, Sparkles, Filter } from 'lucide-react';
import { getProductReviews, submitReview } from '../../services/api';

export default function ProductReviewsSection({
  productId,
  productRating = 5.0,
  reviewsCount = 0,
  onReviewSubmitted
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  // Filter state
  const [starFilter, setStarFilter] = useState('all');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    getProductReviews(productId)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch((err) => console.warn('Lỗi tải reviews:', err))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setFormMsg({ text: 'Vui lòng nhập đôi lời nhận xét về sản phẩm bạn nhé!', type: 'error' });
      return;
    }

    setSubmitting(true);
    setFormMsg({ text: '', type: '' });

    try {
      const payload = {
        rating,
        comment: comment.trim(),
        reviewerName: reviewerName.trim() || 'Khách yêu sen đá'
      };

      await submitReview(productId, payload);

      const newReviewItem = {
        id: Date.now(),
        productId,
        rating,
        reviewerName: payload.reviewerName,
        comment: payload.comment,
        createdAt: new Date().toISOString()
      };

      setReviews((prev) => [newReviewItem, ...prev]);
      setFormMsg({ text: 'Cảm ơn bạn đã gửi đánh giá quý báu cho Sen Xinh Garden! 🌱', type: 'success' });
      setComment('');
      setShowForm(false);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setFormMsg({ text: err.message || 'Không thể gửi đánh giá, vui lòng thử lại sau!', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = useMemo(() => {
    if (starFilter === 'all') return reviews;
    return reviews.filter((r) => Number(r.rating) === Number(starFilter));
  }, [reviews, starFilter]);

  // Calculate star distribution
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    const total = reviews.length || 1;
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100)
    };
  }, [reviews]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Gần đây';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Gần đây';
    }
  };

  return (
    <section className="product-reviews-section">
      {/* Section Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="section-subtitle" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
            Trải Nghiệm Khách Hàng
          </span>
          <h2 style={{ fontSize: '1.45rem', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Đánh Giá & Phản Hồi Thực Tế</span>
            <Sparkles size={20} color="var(--accent)" />
          </h2>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <MessageSquare size={16} />
          <span>{showForm ? 'Đóng Form Đánh Giá' : 'Viết Đánh Giá Của Bạn'}</span>
        </button>
      </div>

      {/* Review Summary Score Card */}
      <div className="reviews-summary-card">
        {/* Score & Stars */}
        <div className="reviews-score-col">
          <div className="reviews-score-number">
            {Number(productRating || 5.0).toFixed(1)}
          </div>
          <div style={{ display: 'flex', gap: '4px', margin: '10px 0 6px', color: '#F59E0B' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                fill={s <= Math.round(Number(productRating || 5)) ? '#F59E0B' : 'none'}
                color="#F59E0B"
              />
            ))}
          </div>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Dựa trên <strong>{reviewsCount || reviews.length}</strong> lượt phản hồi
          </span>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            fontSize: '0.78rem',
            color: 'var(--primary)',
            background: 'var(--primary-light)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600
          }}>
            <CheckCircle2 size={13} />
            <span>100% Khách mua hàng xác thực</span>
          </div>
        </div>

        {/* Progress Bars Breakdown */}
        <div className="reviews-bars-col">
          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem' }}>
              <span style={{ width: '40px', color: 'var(--text-main)', fontWeight: 600, flexShrink: 0 }}>{s} sao</span>
              <div style={{
                flexGrow: 1,
                height: '8px',
                background: 'rgba(0,0,0,0.06)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${ratingDistribution[s]}%`,
                  height: '100%',
                  background: s >= 4 ? '#10B981' : s === 3 ? '#F59E0B' : '#EF4444',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <span style={{ width: '36px', textAlign: 'right', color: 'var(--text-light)', fontSize: '0.8rem', flexShrink: 0 }}>
                {ratingDistribution[s]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Form Collapsible */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="review-form-card"
        >
          <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Chia sẻ trải nghiệm của bạn về mầm sen này</span>
          </h3>

          {/* Star selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px' }}>
              Chấm điểm sự hài lòng của bạn:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  className="review-star-btn"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  title={`${s} sao`}
                  aria-label={`${s} sao`}
                >
                  <Star
                    size={26}
                    fill={(hoverRating || rating) >= s ? '#F59E0B' : 'none'}
                    color="#F59E0B"
                  />
                </button>
              ))}
              <span style={{ marginLeft: '8px', fontSize: '0.86rem', color: '#F59E0B', fontWeight: 700 }}>
                {rating === 5 ? 'Tuyệt vời (5/5) ⭐' : rating === 4 ? 'Rất hài lòng (4/5) ⭐' : rating === 3 ? 'Bình thường (3/5)' : 'Cần cải thiện'}
              </span>
            </div>
          </div>

          {/* Name input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              Họ và tên hoặc biệt danh:
            </label>
            <input
              type="text"
              placeholder="VD: Minh Anh (Hà Nội)..."
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Comment text */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
              Nội dung nhận xét & cảm nhận khi nhận cây: <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Cây nhận về rễ khỏe không? Quy cách bọc 4 lớp chống dập của nhà vườn như thế nào?..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: 1.6
              }}
            />
          </div>

          {formMsg.text && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              marginBottom: '16px',
              background: formMsg.type === 'error' ? '#FEE2E2' : '#D1FAE5',
              color: formMsg.type === 'error' ? '#DC2626' : '#059669',
              fontWeight: 500
            }}>
              {formMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={16} />
              <span>{submitting ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay'}</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowForm(false)}
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="reviews-filter-bar">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={14} /> Lọc:
        </span>
        {['all', '5', '4', '3'].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setStarFilter(val)}
            className={`review-filter-btn ${starFilter === val ? 'active' : ''}`}
          >
            {val === 'all' ? `Tất cả (${reviews.length})` : `${val} sao`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Đang tải đánh giá từ khách hàng...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-light)'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            Chưa có đánh giá nào phù hợp với bộ lọc. Hãy là người đầu tiên chia sẻ cảm nhận về mầm sen này!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="review-card-item"
            >
              {/* Review Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Initials Avatar */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    flexShrink: 0
                  }}>
                    {(rev.reviewerName || 'K').charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {rev.reviewerName || 'Khách yêu sen đá'}
                      </strong>
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#059669',
                        background: '#D1FAE5',
                        padding: '1px 7px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <CheckCircle2 size={11} /> Đã mua hàng
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= (rev.rating || 5) ? '#F59E0B' : 'none'}
                          color="#F59E0B"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                  {formatDate(rev.createdAt)}
                </span>
              </div>

              {/* Review Content */}
              <p style={{
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                margin: '8px 0 0'
              }}>
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
