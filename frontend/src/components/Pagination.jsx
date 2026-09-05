import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}) {
  if (totalItems === 0 || totalPages <= 1) return null;

  // Generate page numbers with ellipsis if needed
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage || page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination-controls">
        {/* First page button */}
        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          title="Trang đầu tiên"
          aria-label="Trang đầu tiên"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous page button */}
        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          title="Trang trước"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
          <span className="nav-btn-text">Trước</span>
        </button>

        {/* Number buttons */}
        <div className="pagination-numbers">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                className={`pagination-btn pagination-num-btn ${isActive ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Trang tiếp theo"
          aria-label="Trang sau"
        >
          <span className="nav-btn-text">Sau</span>
          <ChevronRight size={16} />
        </button>

        {/* Last page button */}
        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          title="Trang cuối cùng"
          aria-label="Trang cuối cùng"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
