import React from 'react';

const PromotionPagination = ({
    currentPage,
    totalPages,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}) => {
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
        if (e.key === 'Enter') {
            const page = parseInt(e.target.value, 10);
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
                e.target.value = '';
            }
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="pm-pagination">
            <div className="pm-pagination-left">
                <span>Hiển thị</span>
                <select
                    value={rowsPerPage}
                    onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                    aria-label="Số dòng mỗi trang"
                >
                    {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <span>/ trang</span>
            </div>

            <div className="pm-pagination-center">
                <button
                    className="pm-page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Trang trước"
                >
                    ←
                </button>
                {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)' }}>…</span>
                    ) : (
                        <button
                            key={p}
                            className={`pm-page-btn ${currentPage === p ? 'active' : ''}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    className="pm-page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Trang sau"
                >
                    →
                </button>
            </div>

            <div className="pm-pagination-right">
                <span>Trang {currentPage} / {totalPages}</span>
                <span>|</span>
                <span>Đến trang</span>
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    onKeyDown={handleJump}
                    aria-label="Nhập số trang"
                />
            </div>
        </div>
    );
};

export default PromotionPagination;
