import React, { useState } from 'react';

/**
 * ReturnPagination — rows per page, page buttons, jump-to-page.
 */
const ReturnPagination = ({
    currentPage,
    totalPages,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}) => {
    const [jumpValue, setJumpValue] = useState('');

    const handleJump = (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(jumpValue, 10);
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
            setJumpValue('');
        }
    };

    // Build page number array
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="rm-pagination">
            <div className="rm-pagination-left">
                <span>Hiển thị</span>
                <select
                    value={rowsPerPage}
                    onChange={e => onRowsPerPageChange(Number(e.target.value))}
                >
                    {[10, 25, 50, 100].map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <span>dòng / trang</span>
            </div>

            <div className="rm-pagination-center">
                <button
                    className="rm-page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Trang trước"
                >
                    ‹
                </button>
                {getPageNumbers().map(p => (
                    <button
                        key={p}
                        className={`rm-page-btn ${p === currentPage ? 'active' : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}
                <button
                    className="rm-page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Trang sau"
                >
                    ›
                </button>
            </div>

            <div className="rm-pagination-right">
                <span>Trang {currentPage} / {totalPages}</span>
                <span>|</span>
                <span>Đi tới:</span>
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpValue}
                    onChange={e => setJumpValue(e.target.value)}
                    onKeyDown={handleJump}
                    placeholder="..."
                    aria-label="Nhảy đến trang"
                />
            </div>
        </div>
    );
};

export default ReturnPagination;
