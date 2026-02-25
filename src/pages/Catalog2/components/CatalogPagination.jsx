import React, { useState } from 'react';
import { VIEW_MODE } from '../mockCatalogData';

const CatalogPagination = ({ currentPage, totalPages, totalProducts, pageSize, onPageChange, onLoadMore }) => {
    const [jumpValue, setJumpValue] = useState('');
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalProducts);

    // Generate visible page numbers (max 5 + ellipsis)
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const handleJump = (e) => {
        e.preventDefault();
        const page = parseInt(jumpValue, 10);
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            setJumpValue('');
        }
    };

    // Load-more mode
    if (VIEW_MODE === 'loadmore') {
        if (currentPage >= totalPages) return null;
        return (
            <div className="catalog-loadmore-wrap">
                <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                    Hiển thị {endItem} trong {totalProducts} sản phẩm
                </div>
                <button className="catalog-loadmore-btn" onClick={onLoadMore}>
                    Xem thêm sản phẩm
                </button>
            </div>
        );
    }

    // Pagination mode
    if (totalPages <= 1) return null;

    return (
        <div className="catalog-pagination">
            <span className="catalog-pagination-info">
                Hiển thị {startItem}–{endItem} trong {totalProducts} sản phẩm
            </span>

            <div className="catalog-pagination-controls">
                {/* Prev button */}
                <button
                    className="catalog-page-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                >
                    ‹
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="catalog-page-ellipsis">…</span>
                    ) : (
                        <button
                            key={page}
                            className={`catalog-page-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    )
                )}

                {/* Next button */}
                <button
                    className="catalog-page-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Trang sau"
                >
                    ›
                </button>
            </div>

            {/* Jump to page */}
            <form className="catalog-pagination-jump" onSubmit={handleJump}>
                <span>Đến trang</span>
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    placeholder="#"
                />
            </form>
        </div>
    );
};

export default CatalogPagination;
