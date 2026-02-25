import React from 'react';

const EmptyState = ({ onClearFilters, onShowAll }) => {
    return (
        <div className="catalog-empty">
            {/* SVG illustration: shoe with magnifying glass */}
            <svg className="catalog-empty-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="170" rx="80" ry="10" fill="#E5E7EB" />
                <path d="M40 120c0-30 15-60 60-60s60 30 60 60v20c0 10-8 18-18 18H58c-10 0-18-8-18-18v-20z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
                <rect x="55" y="110" width="90" height="12" rx="6" fill="#D1D5DB" />
                <rect x="65" y="125" width="70" height="8" rx="4" fill="#E5E7EB" />
                <circle cx="145" cy="75" r="25" stroke="#6366F1" strokeWidth="3" fill="none" />
                <line x1="163" y1="93" x2="180" y2="110" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                <path d="M135 70c3-5 10-8 15-5" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <h2 className="catalog-empty-title">Không tìm thấy sản phẩm nào</h2>
            <p className="catalog-empty-text">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>

            <div className="catalog-empty-actions">
                <button className="catalog-empty-btn primary" onClick={onClearFilters}>
                    Xóa tất cả bộ lọc
                </button>
                <button className="catalog-empty-btn outlined" onClick={onShowAll}>
                    Xem tất cả sản phẩm
                </button>
            </div>
        </div>
    );
};

export default EmptyState;
