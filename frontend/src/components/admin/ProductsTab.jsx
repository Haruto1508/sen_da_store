import React, { useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import Pagination from '../Pagination';
import { CATEGORIES } from '../../data/products';
import { formatPrice } from './adminConstants';

export default function ProductsTab({
  products,
  productSearch,
  setProductSearch,
  productCategory,
  setProductCategory,
  productStockFilter,
  setProductStockFilter,
  productPage,
  setProductPage,
  itemsPerPage = 10,
  onOpenAddProduct,
  onOpenEditProduct,
  onQuickStockChange,
  onDeleteProduct
}) {
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, productSearch, productCategory, productStockFilter]);

  const productTotalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const pagedProducts = filteredProducts.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search-wrapper">
          <Search size={17} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm theo tên sen đá, tên khoa học..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="select-filter"
            style={{ padding: '8px 28px 8px 12px', fontSize: '0.85rem' }}
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
            style={{ padding: '8px 28px 8px 12px', fontSize: '0.85rem' }}
          >
            <option value="all">Tất Cả Tồn Kho</option>
            <option value="low">⚠️ Sắp Hết (≤ 10)</option>
            <option value="out">❌ Hết Hàng (0)</option>
          </select>

          <button
            className="btn-primary"
            onClick={onOpenAddProduct}
            style={{ padding: '9px 18px', fontSize: '0.88rem' }}
          >
            <Plus size={16} />
            <span>Thêm Cây Mới</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sen Đá</th>
                <th>Danh Mục</th>
                <th>Giá Bán</th>
                <th>Tồn Kho</th>
                <th>Đặc Tính</th>
                <th>Huy Hiệu</th>
                <th style={{ textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>
                    Chưa có sản phẩm nào phù hợp với bộ lọc tìm kiếm
                  </td>
                </tr>
              ) : (
                pagedProducts.map((prod) => {
                  const isLow = (prod.inStock || 0) > 0 && (prod.inStock || 0) <= 10;
                  const isOut = (prod.inStock || 0) === 0;

                  return (
                    <tr key={prod.id}>
                      <td>
                        <div className="admin-prod-cell">
                          <img
                            src={
                              prod.image ||
                              'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={prod.name}
                            className="admin-prod-thumb"
                          />
                          <div>
                            <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.95rem' }}>
                              {prod.name}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                              {prod.scientificName || 'Sen mọng nước'}
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
                            fontWeight: 500
                          }}
                        >
                          {CATEGORIES.find((c) => c.id === prod.category)?.name || prod.category}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.98rem' }}>
                            {formatPrice(prod.price)}
                          </strong>
                          {prod.originalPrice > prod.price && (
                            <span
                              style={{
                                fontSize: '0.78rem',
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
                          >
                            {isOut ? 'Hết hàng' : isLow ? `Còn ít (${prod.inStock})` : `Còn ${prod.inStock}`}
                          </span>

                          <div className="stock-stepper">
                            <button
                              className="stock-step-btn"
                              onClick={() => onQuickStockChange(prod, -1)}
                              title="Giảm 1 cây"
                            >
                              -
                            </button>
                            <button
                              className="stock-step-btn"
                              onClick={() => onQuickStockChange(prod, 1)}
                              title="Tăng 1 cây"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <div>☀️ {prod.light || 'Nắng nhẹ'}</div>
                          <div>💧 {prod.watering || '1 tuần/lần'}</div>
                        </div>
                      </td>
                      <td>
                        {prod.badge ? (
                          <span
                            style={{
                              background: '#FEF3C7',
                              color: '#B45309',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {prod.badge}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn-icon-action"
                            onClick={() => onOpenEditProduct(prod)}
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon-action delete"
                            onClick={() => onDeleteProduct(prod)}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={16} />
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
        <Pagination
          currentPage={productPage}
          totalPages={productTotalPages}
          totalItems={filteredProducts.length}
          onPageChange={setProductPage}
        />
      </div>
    </div>
  );
}
