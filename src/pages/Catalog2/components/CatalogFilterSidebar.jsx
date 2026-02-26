import React, { useState } from 'react';
import CategoryTree from './CategoryTree';
import BrandFilter from './BrandFilter';
import PriceRangeSlider from './PriceRangeSlider';
import SizeFilter from './SizeFilter';
import ColorFilter from './ColorFilter';

/**
 * CatalogFilterSidebar — uses real API filter options.
 *
 * Props:
 *   filters        — from useProducts() hook
 *   filterOptions  — from useFilterOptions() hook: { categories, brands, sizes, colors, maxPrice }
 *   onFilterChange — (key, value) => void
 *   onReset        — () => void
 */
const CatalogFilterSidebar = ({ filters, filterOptions, onFilterChange, onReset }) => {
    // Accept both {categories, brands, ...} or {options: {categories, ...}}
    const opts = (filterOptions && filterOptions.options) ? filterOptions.options : (filterOptions || {});
    const { categories = [], brands = [], sizes = [], colors = [], maxPrice } = opts;
    const [collapsed, setCollapsed] = useState({});

    const toggleSection = (key) =>
        setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

    // Single-select toggle: if same value is clicked, deselect (set to undefined)
    const toggleSingle = (key, value) => {
        onFilterChange(key, filters[key] === value ? undefined : value);
    };

    const sectionHeader = (label, key) => (
        <h3
            className={`catalog-filter-title ${collapsed[key] ? 'collapsed' : ''}`}
            onClick={() => toggleSection(key)}
        >
            {label}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
        </h3>
    );

    return (
        <div className="catalog-filter-sidebar">
            {/* Category */}
            <div className="catalog-filter-section">
                {sectionHeader('Danh mục', 'category')}
                {!collapsed.category && (
                    <CategoryTree
                        categories={categories}
                        selectedCategory={filters.categoryId}
                        onSelect={(catId) => toggleSingle('categoryId', catId)}
                    />
                )}
            </div>

            {/* Brand */}
            <div className="catalog-filter-section">
                {sectionHeader('Thương hiệu', 'brands')}
                {!collapsed.brands && (
                    <BrandFilter
                        brands={brands}
                        selectedBrands={filters.brandId != null ? [filters.brandId] : []}
                        onToggle={(id) => toggleSingle('brandId', id)}
                    />
                )}
            </div>

            {/* Price Range */}
            <div className="catalog-filter-section">
                {sectionHeader('Khoảng giá', 'price')}
                {!collapsed.price && (
                    <PriceRangeSlider
                        priceRange={[filters.minPrice ?? 0, filters.maxPrice ?? (maxPrice ?? 5000000)]}
                        maxPrice={maxPrice ?? 5000000}
                        onApply={([min, max]) => {
                            onFilterChange('minPrice', min > 0 ? min : undefined);
                            onFilterChange('maxPrice', max < (maxPrice ?? 5000000) ? max : undefined);
                        }}
                    />
                )}
            </div>

            {/* Size */}
            <div className="catalog-filter-section">
                {sectionHeader('Size', 'sizes')}
                {!collapsed.sizes && (
                    <SizeFilter
                        sizes={sizes}
                        selectedSizes={filters.sizeName != null ? [filters.sizeName] : []}
                        onToggle={(size) => toggleSingle('sizeName', size)}
                    />
                )}
            </div>

            {/* Color */}
            <div className="catalog-filter-section">
                {sectionHeader('Màu sắc', 'colors')}
                {!collapsed.colors && (
                    <ColorFilter
                        colors={colors}
                        selectedColors={filters.colorId}
                        onToggle={(id) => toggleSingle('colorId', id)}
                    />
                )}
            </div>

            {/* Availability toggles */}
            <div className="catalog-filter-section">
                {sectionHeader('Trạng thái', 'availability')}
                {!collapsed.availability && (
                    <div className="catalog-availability-toggles">
                        <label className="catalog-toggle-row">
                            <input
                                type="checkbox"
                                checked={!!filters.isNew}
                                onChange={() => onFilterChange('isNew', filters.isNew ? undefined : true)}
                            />
                            <span>Hàng mới về</span>
                        </label>
                        <label className="catalog-toggle-row">
                            <input
                                type="checkbox"
                                checked={!!filters.onSale}
                                onChange={() => onFilterChange('onSale', filters.onSale ? undefined : true)}
                            />
                            <span>Đang khuyến mãi</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Reset */}
            <button className="catalog-reset-btn" onClick={onReset}>
                Xóa tất cả bộ lọc
            </button>
        </div>
    );
};

export default CatalogFilterSidebar;
