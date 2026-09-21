import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Sprout,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sun,
  Droplets,
  Star,
  MessageSquare
} from 'lucide-react';
import Pagination from '../Pagination';
import ProductReviewsModal from './ProductReviewsModal';
import { CATEGORIES } from '../../data/products';
import { formatPrice } from './adminConstants';

export default function ProductsTab({
  products = [],
  productSearch = '',
  setProductSearch,
  productCategory = 'all',
  setProductCategory,
  productStockFilter = 'all',
  setProductStockFilter,
  productPage = 1,
  setProductPage,
  itemsPerPage = 10,
  onOpenAddProduct,
  onOpenEditProduct,
  onQuickStockChange,
  onDeleteProduct
}) {
  const [sortBy, setSortBy] = useState('default');
  const [selectedReviewProduct, setSelectedReviewProduct] = useState(null);

  // Reset page when any filter changes
  useEffect(() => {
    if (setProductPage) setProductPage(1);
  }, [productSearch, productCategory, productStockFilter, sortBy, setProductPage]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.scientificName && p.scientificName.toLowerCase().includes(productSearch.toLowerCase()));

      const matchCategory = productCategory === 'all' || p.category === productCategory;

      let matchStock = true;
      if (productStockFilter === 'low') matchStock = (p.inStock || 0) > 0 && (p.inStock || 0) <= 10;
      else if (productStockFilter === 'out') matchStock = (p.inStock || 0) === 0;

      return matchSearch && matchCategory && matchStock;
    });

    // Xếp hạng theo đánh giá hoặc giá bán
    if (sortBy === 'rating-desc') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'rating-asc') {
      result.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else if (sortBy === 'reviews-desc') {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [products, productSearch, productCategory, productStockFilter, sortBy]);

  const productTotalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const pagedProducts = filteredProducts.slice(
    (productPage - 1) * itemsPerPage,
    productPage * itemsPerPage
  );

  return (
    <div className="admin-tab-content">
      {/* Toolbar */}
      <div className="admin-toolbar-wrap">
        <div className="admin-search-wrapper" style={{ maxWidth: '340px' }}>
          <Search size={16} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm theo tên sen đá, tên khoa học..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>

        <div className="admin-toolbar-filters">
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="select-filter"
            style={{ padding: '8px 28px 8px 12px', fontSize: '0.84rem' }}
          >
            <option value="all">Tất Cả Danh Mục</option>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={productStockFilter}
            onChange={(e) => setProductStockFilter(e.target.value)}
            className="select-filter"
            style={{ padding: '8px 28px 8px 12px', fontSize: '0.84rem' }}
          >
            <option value="all">Tất Cả Tồn Kho</option>
            <option value="low">⚠️ Sắp Hết (≤ 10)</option>
            <option value="out">❌ Hết Hàng (0)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-filter"
            style={{ padding: '8px 28px 8px 12px', fontSize: '0.84rem', fontWeight: 600, borderColor: 'var(--primary)' }}
          >
            <option value="default">Sắp xếp: Mặc định</option>
            <option value="rating-desc">⭐ Đánh giá cao nhất (Top Rated)</option>
            <option value="rating-asc">⭐ Đánh giá thấp nhất</option>
            <option value="reviews-desc">💬 Nhiều đánh giá nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>

          <span
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-main)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)'
            }}
          >
            Tổng: <strong style={{ color: 'var(--primary)' }}>{filteredProducts.length}</strong> / {products.length} cây
          </span>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddProduct}
            style={{ padding: '9px 18px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Thêm Cây Mới</span>
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="admin-table-wrapper">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Sen Đá & Giống Loài</th>
                <th style={{ width: '14%' }}>Phân Loại</th>
                <th style={{ width: '12%' }}>Giá Bán</th>
                <th style={{ width: '16%' }}>Tồn Kho & Điều Chỉnh</th>
                <th style={{ width: '14%' }}>⭐ Đánh Giá & Feedback</th>
                <th style={{ width: '10%' }}>Chăm Sóc</th>
                <th style={{ textAlign: 'right', width: '6%' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Sprout size={44} style={{ opacity: 0.25, marginBottom: '10px' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>
                      Không tìm thấy cây sen đá nào phù hợp
                    </div>
                    <small style={{ color: 'var(--text-light)' }}>
                      Thử đổi từ khóa hoặc điều chỉnh bộ lọc danh mục và tồn kho
                    </small>
                  </td>
                </tr>
              ) : (
                pagedProducts.map((prod) => {
                  const isLow = (prod.inStock || 0) > 0 && (prod.inStock || 0) <= 10;
                  const isOut = (prod.inStock || 0) === 0;

                  return (
                    <tr key={prod.id} style={{ transition: 'background 0.2s' }}>
                      <td>
                        <div className="admin-prod-cell">
                          <img
                            src={
                              prod.image ||
                              'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={prod.name}
                            className="admin-prod-thumb"
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: '1px solid var(--border-light)'
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: 'var(--text-main)', fontSize: '0.94rem' }}>
                                {prod.name}
                              </strong>
                              {prod.badge && (
                                <span
                                  style={{
                                    background: '#FEF3C7',
                                    color: '#B45309',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {prod.badge}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontStyle: 'italic', display: 'block' }}>
                              {prod.scientificName || 'Echeveria spp.'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            background: 'var(--bg-main)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          {CATEGORIES.find((c) => c.id === prod.category)?.name || prod.category}
                        </span>
                      </td>

                      <td>
                        <div>
                          <strong style={{ color: 'var(--primary)', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                            {formatPrice(prod.price)}
                          </strong>
                          {prod.originalPrice > prod.price && (
                            <span
                              style={{
                                fontSize: '0.76rem',
                                color: 'var(--text-light)',
                                textDecoration: 'line-through',
                                display: 'block'
                              }}
                            >
                              {formatPrice(prod.originalPrice)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className={`stock-pill ${
                              isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'
                            }`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            {isOut ? (
                              <>
                                <XCircle size={12} />
                                <span>Hết hàng</span>
                              </>
                            ) : isLow ? (
                              <>
                                <AlertTriangle size={12} />
                                <span>Còn {prod.inStock}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={12} />
                                <span>Còn {prod.inStock}</span>
                              </>
                            )}
                          </span>

                          <div className="stock-stepper">
                            <button
                              type="button"
                              className="stock-step-btn"
                              onClick={() => onQuickStockChange(prod, -1)}
                              title="Giảm tồn kho 1 cây"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              className="stock-step-btn"
                              onClick={() => onQuickStockChange(prod, 1)}
                              title="Tăng tồn kho 1 cây"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: 800, color: '#D97706', fontSize: '0.94rem' }}>
                              {Number(prod.rating || 5.0).toFixed(1)}
                            </span>
                            <Star size={13} fill="#F59E0B" color="#F59E0B" />
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                              ({prod.reviewsCount || 0})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedReviewProduct(prod)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.76rem',
                              padding: 0,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              marginTop: '3px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 600
                            }}
                            title="Xem nhận xét của khách hàng"
                          >
                            <MessageSquare size={12} />
                            <span>Xem nhận xét</span>
                          </button>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sun size={12} color="#D97706" />
                            <span>{prod.light || 'Nắng nhẹ'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Droplets size={12} color="#2563EB" />
                            <span>{prod.watering || '1 tuần/lần'}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-icon-action"
                            onClick={() => onOpenEditProduct(prod)}
                            title="Chỉnh sửa thông tin cây"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon-action delete"
                            onClick={() => onDeleteProduct(prod)}
                            title="Xóa cây khỏi vườn"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={productPage}
          totalPages={productTotalPages}
          totalItems={filteredProducts.length}
          onPageChange={setProductPage}
        />
      </div>

      {/* Product Reviews Modal */}
      {selectedReviewProduct && (
        <ProductReviewsModal
          product={selectedReviewProduct}
          onClose={() => setSelectedReviewProduct(null)}
        />
      )}
    </div>
  );
}
