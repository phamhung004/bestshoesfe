import React from 'react';
import { formatVND } from '../../../utils/formatPrice';

/**
 * ActiveFilterChips — uses real API filter keys.
 *
 * Props:
 *   filters        — current filter state from useProducts()
 *   filterOptions  — { categories, brands, sizes, colors } from useFilterOptions()
 *   onRemoveFilter — (key, value?) => void
 *   onClearAll     — () => void
 */
const ActiveFilterChips = ({ filters, filterOptions, onRemoveFilter, onClearAll }) => {
    // Accept both {categories, brands, ...} or {options: {categories, ...}}
    const opts = (filterOptions && filterOptions.options) ? filterOptions.options : (filterOptions || {});
    const { categories = [], brands = [], colors = [] } = opts;
    const chips = [];

    // Category
    if (filters.categoryId) {
        const cat = categories.find(c => c.categoryId === filters.categoryId);
        chips.push({ key: 'categoryId', label: cat ? cat.name : `Danh mục #${filters.categoryId}` });
    }

    // Brand
    if (filters.brandId != null) {
        const brand = brands.find(b => b.brandId === filters.brandId);
        chips.push({ key: 'brandId', label: brand ? brand.name : `Thương hiệu #${filters.brandId}` });
    }

    // Size
    if (filters.sizeName) {
        chips.push({ key: 'sizeName', label: `Size ${filters.sizeName}` });
    }

    // Color
    if (filters.colorId != null) {
        const color = colors.find(c => c.colorId === filters.colorId);
        chips.push({ key: 'colorId', label: `Màu ${color ? color.colorName : filters.colorId}` });
    }

    // Price range
    if (filters.minPrice != null || filters.maxPrice != null) {
        const min = filters.minPrice ?? 0;
        const max = filters.maxPrice;
        const label = max != null
            ? `${formatVND(min)} — ${formatVND(max)}`
            : `Từ ${formatVND(min)}`;
        chips.push({ key: 'priceRange', label });
    }

    // isNew
    if (filters.isNew) chips.push({ key: 'isNew', label: 'Hàng mới về' });

    // onSale
    if (filters.onSale) chips.push({ key: 'onSale', label: 'Đang khuyến mãi' });

    // keyword
    if (filters.keyword) chips.push({ key: 'keyword', label: `"${filters.keyword}"` });

    if (chips.length === 0) return null;

    const handleRemove = (chip) => {
        if (chip.key === 'priceRange') {
            onRemoveFilter('minPrice');
            onRemoveFilter('maxPrice');
        } else {
            onRemoveFilter(chip.key);
        }
    };

    return (
        <div className="catalog-active-chips">
            {chips.map((chip, idx) => (
                <span key={`${chip.key}-${idx}`} className="catalog-chip">
                    {chip.label}
                    <button
                        className="catalog-chip-remove"
                        onClick={() => handleRemove(chip)}
                        aria-label={`Xóa bộ lọc ${chip.label}`}
                    >
                        ×
                    </button>
                </span>
            ))}
            <button className="catalog-clear-all-link" onClick={onClearAll}>
                Xóa tất cả bộ lọc
            </button>
        </div>
    );
};

export default ActiveFilterChips;
