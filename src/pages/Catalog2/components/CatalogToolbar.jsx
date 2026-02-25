import React from 'react';

const SORT_OPTIONS = [
    { value: 'featured', label: 'Nổi bật nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'bestseller', label: 'Bán chạy nhất' },
];

const CatalogToolbar = ({ totalProducts, currentRange, sortBy, onSortChange, viewMode, onViewChange }) => {
    return (
        <div className="catalog-toolbar">
            {/* Left: result count */}
            <span className="catalog-toolbar-count">
                Hiển thị {currentRange[0]}–{currentRange[1]} trong {totalProducts} sản phẩm
            </span>

            {/* Center: sort dropdown */}
            <div className="catalog-toolbar-center">
                <select
                    className="catalog-sort-select"
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Right: view toggles */}
            <div className="catalog-toolbar-right">
                {/* 4-col grid */}
                <button
                    className={`catalog-view-btn ${viewMode === 'grid-4' ? 'active' : ''}`}
                    onClick={() => onViewChange('grid-4')}
                    aria-label="Xem dạng lưới 4 cột"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="5.5" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="10" y="1" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="1" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="5.5" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="10" y="5.5" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="1" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="5.5" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
                        <rect x="10" y="10" width="3" height="3" rx="0.5" fill="currentColor" />
                    </svg>
                </button>

                {/* 2-col grid */}
                <button
                    className={`catalog-view-btn ${viewMode === 'grid-2' ? 'active' : ''}`}
                    onClick={() => onViewChange('grid-2')}
                    aria-label="Xem dạng lưới 2 cột"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="6" height="6" rx="0.5" fill="currentColor" />
                        <rect x="9" y="1" width="6" height="6" rx="0.5" fill="currentColor" />
                        <rect x="1" y="9" width="6" height="6" rx="0.5" fill="currentColor" />
                        <rect x="9" y="9" width="6" height="6" rx="0.5" fill="currentColor" />
                    </svg>
                </button>

                {/* List view */}
                <button
                    className={`catalog-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => onViewChange('list')}
                    aria-label="Xem dạng danh sách"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="14" height="3" rx="0.5" fill="currentColor" />
                        <rect x="1" y="6" width="14" height="3" rx="0.5" fill="currentColor" />
                        <rect x="1" y="11" width="14" height="3" rx="0.5" fill="currentColor" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CatalogToolbar;
