import React from 'react';
import { BRANDS, SIZES, COLORS, MATERIALS, CATEGORIES } from '../mockCatalogData';

const ActiveFilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
    const chips = [];

    // Category chip
    if (filters.category) {
        const cat = CATEGORIES.find(c => c.category_id === filters.category);
        if (cat) {
            chips.push({ key: 'category', label: cat.name, value: filters.category });
        }
    }

    // Brand chips
    filters.brands.forEach(bid => {
        const brand = BRANDS.find(b => b.brand_id === bid);
        if (brand) {
            chips.push({ key: 'brands', label: brand.name, value: bid });
        }
    });

    // Size chips
    filters.sizes.forEach(sid => {
        const size = SIZES.find(s => s.size_id === sid);
        if (size) {
            chips.push({ key: 'sizes', label: `Size ${size.size_name}`, value: sid });
        }
    });

    // Color chips
    filters.colors.forEach(cid => {
        const color = COLORS.find(c => c.color_id === cid);
        if (color) {
            chips.push({ key: 'colors', label: `Màu ${color.color_name}`, value: cid });
        }
    });

    // Material chips
    filters.materials.forEach(mid => {
        const mat = MATERIALS.find(m => m.material_id === mid);
        if (mat) {
            chips.push({ key: 'materials', label: mat.material_name, value: mid });
        }
    });

    // Price range chip
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) {
        const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
        chips.push({
            key: 'priceRange',
            label: `${fmt(filters.priceRange[0])} — ${fmt(filters.priceRange[1])} ₫`,
            value: 'price',
        });
    }

    // Rating chip
    if (filters.rating) {
        chips.push({ key: 'rating', label: `${filters.rating}★ trở lên`, value: filters.rating });
    }

    // Availability chips
    if (filters.availability.inStock) {
        chips.push({ key: 'availability-inStock', label: 'Còn hàng', value: 'inStock' });
    }
    if (filters.availability.onPromotion) {
        chips.push({ key: 'availability-onPromotion', label: 'Đang khuyến mãi', value: 'onPromotion' });
    }
    if (filters.availability.newArrivals) {
        chips.push({ key: 'availability-newArrivals', label: 'Hàng mới về', value: 'newArrivals' });
    }

    if (chips.length === 0) return null;

    return (
        <div className="catalog-active-chips">
            {chips.map((chip, idx) => (
                <span key={`${chip.key}-${idx}`} className="catalog-chip">
                    {chip.label}
                    <button
                        className="catalog-chip-remove"
                        onClick={() => onRemoveFilter(chip.key, chip.value)}
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
