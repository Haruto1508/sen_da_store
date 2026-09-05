import React from 'react';
import { NEWS_ARTICLES } from '../data/news';
import { ArrowLeft, Calendar, Clock, User, Share2, Sprout, ArrowRight } from 'lucide-react';

export default function NewsDetailPage({
  articleId,
  onNavigateBack,
  onNavigateHome,
  onNavigateNews,
  onNavigateShop,
  onSelectArticle
}) {
  const article = NEWS_ARTICLES.find((a) => a.id === articleId) || NEWS_ARTICLES[0];

  const relatedArticles = NEWS_ARTICLES.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <div className="news-detail-page">
      {/* Header Banner */}
      <div className="page-header-banner" style={{ padding: '24px 0' }}>
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <button className="breadcrumb-link" onClick={onNavigateNews}>Tin Tức & Cẩm Nang</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current" style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {article.title}
            </span>
          </div>

          <div style={{ marginTop: '16px' }}>
            <button 
              className="btn-secondary" 
              onClick={onNavigateBack}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} />
              <span>Quay Lại Cẩm Nang</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px', maxWidth: '880px' }}>
        {/* Article Meta */}
        <div style={{ marginBottom: '24px' }}>
          <span className="tag-pill" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 700, marginBottom: '12px' }}>
            {article.category}
          </span>
          <h1 style={{ fontSize: '2.4rem', lineHeight: 1.3, margin: '8px 0 16px' }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', color: 'var(--text-muted)', fontSize: '0.88rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '18px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} color="var(--primary)" />
              <strong>{article.author}</strong>
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              {article.date}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} />
              {article.readTime}
            </span>
          </div>
        </div>

        {/* Hero image */}
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '36px', boxShadow: 'var(--shadow-md)', maxHeight: '420px' }}>
          <img 
            src={article.thumbnail} 
            alt={article.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>

        {/* Article content */}
        <div 
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />

        {/* Bottom Banner to Shop */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary-light), #E2EFE7)', 
          border: '1px solid rgba(45, 90, 63, 0.2)',
          borderRadius: 'var(--radius-lg)', 
          padding: '32px', 
          marginTop: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sprout size={22} />
              <span>Muốn tự tay chăm sóc một mầm xanh?</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Ghé thăm cửa hàng Sen Xinh Garden để chọn những cây thuần dưỡng khỏe đẹp nhất!
            </p>
          </div>

          <button className="btn-primary" onClick={onNavigateShop}>
            <span>Khám Phá Cửa Hàng</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div style={{ marginTop: '70px', borderTop: '1px solid var(--border-light)', paddingTop: '40px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Bài Viết Cùng Chủ Đề</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {relatedArticles.map((rel) => (
                <div 
                  key={rel.id} 
                  className="news-card" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onSelectArticle(rel.id);
                  }}
                >
                  <div className="news-card-img-wrap" style={{ height: '160px' }}>
                    <img src={rel.thumbnail} alt={rel.title} className="news-card-img" />
                    <span className="news-category-badge">{rel.category}</span>
                  </div>
                  <div className="news-card-content" style={{ padding: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', lineHeight: 1.4, marginBottom: '6px' }}>{rel.title}</h4>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{rel.summary.slice(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
