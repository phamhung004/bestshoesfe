import React, { useState } from 'react';
import CategoryTree from './CategoryTree';
import BrandFilter from './BrandFilter';
import PriceRangeSlider from './PriceRangeSlider';
import SizeFilter from './SizeFilter';
import ColorFilter from './ColorFilter';
import MaterialFilter from './MaterialFilter';
import RatingFilter from './RatingFilter';
import AvailabilityToggles from './AvailabilityToggles';

const CatalogFilterSidebar = ({ filters, onFilterChange, onReset }) => {
    // Collapsible sections
    const [collapsed, setCollapsed] = useState({});

    const toggleSection = (key) => {
        setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleArray = (key, value) => {
        const arr = filters[key] || [];
        const newArr = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
        onFilterChange(key, newArr);
    };

    return (
        <div className="catalog-filter-sidebar">
            {/* Category Tree */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.category ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('category')}
                >
                    Danh mục
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.category && (
                    <CategoryTree
                        selectedCategory={filters.category}
                        onSelect={(catId) => onFilterChange('category', filters.category === catId ? null : catId)}
                    />
                )}
            </div>

            {/* Brand Filter */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.brands ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('brands')}
                >
                    Thương hiệu
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.brands && (
                    <BrandFilter
                        selectedBrands={filters.brands}
                        onToggle={(id) => toggleArray('brands', id)}
                    />
                )}
            </div>

            {/* Price Range */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.price ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('price')}
                >
                    Khoảng giá
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.price && (
                    <PriceRangeSlider
                        priceRange={filters.priceRange}
                        onApply={(range) => onFilterChange('priceRange', range)}
                    />
                )}
            </div>

            {/* Size Filter */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.sizes ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('sizes')}
                >
                    Size
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.sizes && (
                    <SizeFilter
                        selectedSizes={filters.sizes}
                        onToggle={(id) => toggleArray('sizes', id)}
                    />
                )}
            </div>

            {/* Color Filter */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.colors ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('colors')}
                >
                    Màu sắc
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.colors && (
                    <ColorFilter
                        selectedColors={filters.colors}
                        onToggle={(id) => toggleArray('colors', id)}
                    />
                )}
            </div>

            {/* Material Filter */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.materials ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('materials')}
                >
                    Chất liệu
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.materials && (
                    <MaterialFilter
                        selectedMaterials={filters.materials}
                        onToggle={(id) => toggleArray('materials', id)}
                    />
                )}
            </div>

            {/* Rating Filter */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.rating ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('rating')}
                >
                    Đánh giá
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.rating && (
                    <RatingFilter
                        selectedRating={filters.rating}
                        onSelect={(val) => onFilterChange('rating', val)}
                    />
                )}
            </div>

            {/* Availability Toggles */}
            <div className="catalog-filter-section">
                <h3
                    className={`catalog-filter-title ${collapsed.availability ? 'collapsed' : ''}`}
                    onClick={() => toggleSection('availability')}
                >
                    Trạng thái
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </h3>
                {!collapsed.availability && (
                    <AvailabilityToggles
                        availability={filters.availability}
                        onToggle={(key) => {
                            onFilterChange('availability', {
                                ...filters.availability,
                                [key]: !filters.availability[key],
                            });
                        }}
                    />
                )}
            </div>

            {/* Reset button */}
            <button className="catalog-reset-btn" onClick={onReset}>
                Xóa tất cả bộ lọc
            </button>
        </div>
    );
};

export default CatalogFilterSidebar;
