import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ProductPagination
 * Props:
 *   currentPage       number   1-based current page
 *   totalPages        number
 *   rowsPerPage       number
 *   totalItems        number
 *   onPageChange      (page) => void
 *   onRowsPerPageChange (rows) => void
 */
const ProductPagination = ({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  // Build page number list with ellipsis
  const buildPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    // always include page 1
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pages = totalPages > 0 ? buildPages() : [];

  return (
    <div className="pm-card pm-pagination">
      {/* Left: item range */}
      <span className="pm-page-info">
        Hiển thị{' '}
        <strong>{startItem}</strong>–<strong>{endItem}</strong> của{' '}
        <strong>{totalItems}</strong> sản phẩm
      </span>

      {/* Center: page buttons */}
      <div className="pm-page-buttons">
        <button
          className="pm-page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Trang trước"
          type="button"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="pm-page-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={p}
              className={`pm-page-btn ${currentPage === p ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              type="button"
            >
              {p}
            </button>
          )
        )}

        <button
          className="pm-page-btn"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          title="Trang tiếp"
          type="button"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Right: rows per page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>
          / trang:
        </span>
        <select
          className="pm-rows-select"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProductPagination;
