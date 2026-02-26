import React, { useState } from 'react';

/**
 * BrandFilter — accepts `brands` prop from real API (BrandDTO[]).
 * Each brand: { brandId, name, logo }
 * selectedBrands: number | null (single-select, matches API parameter)
 */
const BrandFilter = ({ selectedBrands, onToggle, brands = [] }) => {
    const [showAll, setShowAll] = useState(false);
    const visibleBrands = showAll ? brands : brands.slice(0, 5);
    // Support single value or array for backward compatibility
    const selectedSet = Array.isArray(selectedBrands)
        ? selectedBrands
        : selectedBrands != null ? [selectedBrands] : [];

    if (brands.length === 0) return <p style={{ color: '#999', fontSize: 13 }}>Đang tải...</p>;

    return (
        <div className="catalog-brand-list">
            {visibleBrands.map(brand => {
                const isChecked = selectedSet.includes(brand.brandId);

                return (
                    <div
                        key={brand.brandId}
                        className="catalog-brand-item"
                        onClick={() => onToggle(brand.brandId)}
                    >
                        <div className={`catalog-checkbox ${isChecked ? 'checked' : ''}`}>
                            {isChecked && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="catalog-brand-name">{brand.name}</span>
                    </div>
                );
            })}
            {brands.length > 5 && (
                <button
                    className="catalog-show-more-btn"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Thu gọn' : `Xem thêm (${brands.length - 5})`}
                </button>
            )}
        </div>
    );
};

export default BrandFilter;
