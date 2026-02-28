import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AccountPagination = ({ currentPage, totalItems, rowsPerPage, onPageChange, onRowsPerPageChange, label }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startItem = totalItems > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="am-card am-pagination" style={{ marginTop: 16 }}>
      <div className="am-pagination-info">
        Hiển thị {startItem}–{endItem} của {totalItems} {label || 'tài khoản'}
      </div>

      <div className="am-pagination-pages">
        <button
          className="am-page-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>
          ) : (
            <button
              key={p}
              className={`am-page-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="am-page-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="am-rows-select">
        Hiển thị
        {[10, 20, 50].map((n) => (
          <button
            key={n}
            className={`am-rows-btn ${rowsPerPage === n ? 'active' : ''}`}
            onClick={() => onRowsPerPageChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccountPagination;
