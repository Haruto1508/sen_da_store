import React, { useState } from 'react';
import { NEWS_ARTICLES } from '../data/news';
import { BookOpen, Clock, Calendar, User, ArrowRight } from 'lucide-react';

export default function NewsPage({ onSelectArticle, onNavigateHome }) {
  const [selectedTag, setSelectedTag] = useState('all');

  const categories = ['all', 'Kỹ Thuật Chăm Sóc', 'Phòng Trị Bệnh', 'Đất & Dinh Dưỡng'];

  const filteredArticles = selectedTag === 'all'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter((a) => a.category === selectedTag);

  return (
    <div className="news-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Tin Tức & Cẩm Nang</span>
          </div>

          <div style={{ marginTop: '14px' }}>
            <span className="section-subtitle" style={{ color: 'var(--accent)' }}>
              Kiến Thức Nhà Vườn
            </span>
            <h1 className="page-title" style={{ fontSize: '2.5rem', marginTop: '4px' }}>
              Cẩm Nang Trồng & Chăm Sóc Sen Đá
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px', maxWidth: '650px' }}>
              Tổng hợp những kinh nghiệm thực tế, mẹo cứu cây úng rễ, bí quyết thuần nắng và phối trộn giá thể chuẩn từ các nghệ nhân làm vườn Đà Lạt.
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        {/* Category tags */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '36px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-tab ${selectedTag === cat ? 'active' : ''}`}
              onClick={() => setSelectedTag(cat)}
            >
              <BookOpen size={14} />
              <span>{cat === 'all' ? 'Tất Cả Bài Viết' : cat}</span>
            </button>
          ))}
        </div>

        {/* Article Grid */}
        <div className="news-grid">
          {filteredArticles.map((article) => (
            <article 
              key={article.id} 
              className="news-card"
              onClick={() => onSelectArticle(article.id)}
            >
              <div className="news-card-img-wrap">
                <img src={article.thumbnail} alt={article.title} className="news-card-img" />
                <span className="news-category-badge">{article.category}</span>
              </div>

              <div className="news-card-content">
                <div className="news-meta">
                  <span><Calendar size={13} /> {article.date}</span>
                  <span>•</span>
                  <span><Clock size={13} /> {article.readTime}</span>
                </div>

                <h3 className="news-card-title">{article.title}</h3>
                <p className="news-card-summary">{article.summary}</p>

                <div className="news-card-footer">
                  <div className="news-author">
                    <User size={14} color="var(--primary)" />
                    <span>{article.author}</span>
                  </div>

                  <span className="news-read-more">
                    <span>Đọc Tiếp</span>
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
