import React, { useState } from 'react';
import { BRANDS, countByBrand } from '../mockCatalogData';

const BrandFilter = ({ selectedBrands, onToggle }) => {
    const [showAll, setShowAll] = useState(false);
    const visibleBrands = showAll ? BRANDS : BRANDS.slice(0, 5);

    return (
        <div className="catalog-brand-list">
            {visibleBrands.map(brand => {
                const isChecked = selectedBrands.includes(brand.brand_id);
                const count = countByBrand(brand.brand_id);

                return (
                    <div
                        key={brand.brand_id}
                        className="catalog-brand-item"
                        onClick={() => onToggle(brand.brand_id)}
                    >
                        <div className={`catalog-checkbox ${isChecked ? 'checked' : ''}`}>
                            {isChecked && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="catalog-brand-name">{brand.name}</span>
                        <span className="catalog-brand-count">({count})</span>
                    </div>
                );
            })}
            {BRANDS.length > 5 && (
                <button
                    className="catalog-show-more-btn"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Thu gọn' : `Xem thêm (${BRANDS.length - 5})`}
                </button>
            )}
        </div>
    );
};

export default BrandFilter;
