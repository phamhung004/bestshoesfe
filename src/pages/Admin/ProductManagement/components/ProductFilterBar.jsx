import React, { useState, useEffect } from 'react';
import { Search, Grid2X2, List, X } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_BRANDS } from '../mockProducts';

/**
 * ProductFilterBar
 *
 * Props:
 *   filters          { search, categoryId, brandId, status, priceRange }
 *   onFilterChange   (key, value) => void
 *   onClearFilters   () => void
 *   activeFilterChips  [{ key, label }]
 *   onRemoveChip     (key) => void
 *   viewMode         'list' | 'grid'
 *   onViewModeChange (mode) => void
 *   sortConfig       { key, dir }
 *   onSortChange     ({ key, dir }) => void
 *   resultCount      number
 *   totalCount       number
 */
const ProductFilterBar = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterChips,
  onRemoveChip,
  viewMode,
  onViewModeChange,
  sortConfig,
  onSortChange,
  resultCount,
  totalCount,
}) => {
  // Local search value for debouncing
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Sync if parent clears filters
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange('search', localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const hasFilters = Object.values(filters).some((v) => v !== '');

  const SORT_OPTIONS = [
    { value: 'updatedAt_desc', label: 'Mới cập nhật' },
    { value: 'createdAt_desc', label: 'Mới nhất' },
    { value: 'createdAt_asc',  label: 'Cũ nhất' },
    { value: 'name_asc',       label: 'Tên A→Z' },
    { value: 'name_desc',      label: 'Tên Z→A' },
    { value: 'price_asc',      label: 'Giá thấp→cao' },
    { value: 'price_desc',     label: 'Giá cao→thấp' },
    { value: 'stock_asc',      label: 'Tồn kho ít nhất' },
  ];

  const sortValue = `${sortConfig.key}_${sortConfig.dir}`;

  return (
    <div className="pm-card pm-filter-bar">
      {/* Row 1: Search + filters */}
      <div className="pm-filter-row">
        {/* Search */}
        <div className="pm-search-wrap">
          <span className="pm-search-icon">
            <Search size={15} />
          </span>
          <input
            type="text"
            className="pm-search-input"
            placeholder="Tìm tên sản phẩm, mã SKU, thương hiệu..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {/* Category */}
        <select
          className="pm-filter-select w-180"
          value={filters.categoryId}
          onChange={(e) => onFilterChange('categoryId', e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {MOCK_CATEGORIES.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Brand */}
        <select
          className="pm-filter-select w-160"
          value={filters.brandId}
          onChange={(e) => onFilterChange('brandId', e.target.value)}
        >
          <option value="">Tất cả thương hiệu</option>
          {MOCK_BRANDS.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          className="pm-filter-select w-160"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang bán</option>
          <option value="OUT_OF_STOCK">Hết hàng</option>
          <option value="INACTIVE">Ngừng bán</option>
          <option value="COMING_SOON">Sắp ra mắt</option>
        </select>

        {/* Price range */}
        <select
          className="pm-filter-select w-160"
          value={filters.priceRange}
          onChange={(e) => onFilterChange('priceRange', e.target.value)}
        >
          <option value="">Tất cả mức giá</option>
          <option value="0-1000000">Dưới 1 triệu</option>
          <option value="1000000-3000000">1 – 3 triệu</option>
          <option value="3000000-5000000">3 – 5 triệu</option>
          <option value="5000000-999999999">Trên 5 triệu</option>
        </select>

        {/* Clear all */}
        {hasFilters && (
          <button
            className="pm-btn pm-btn-ghost pm-btn-sm"
            onClick={onClearFilters}
            type="button"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Row 2: chips + result count + view toggle + sort */}
      <div className="pm-chips-row">
        {/* Result count */}
        <span className="pm-result-count">
          Hiển thị <strong>{resultCount}</strong>
          {resultCount !== totalCount && (
            <> / <strong>{totalCount}</strong></>
          )}{' '}
          sản phẩm
        </span>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="pm-chips-list">
            {activeFilterChips.map((chip) => (
              <span key={chip.key} className="pm-chip">
                {chip.label}
                <button
                  className="pm-chip-remove"
                  onClick={() => onRemoveChip(chip.key)}
                  type="button"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button
              className="pm-chip-clear"
              onClick={onClearFilters}
              type="button"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Right: view toggle + sort */}
        <div className="pm-view-sort">
          {/* View toggle */}
          <div className="pm-view-toggle">
            <button
              className={`pm-btn-icon ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              title="Dạng bảng"
              type="button"
            >
              <List size={16} />
            </button>
            <button
              className={`pm-btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Dạng lưới"
              type="button"
            >
              <Grid2X2 size={16} />
            </button>
          </div>

          {/* Sort */}
          <select
            className="pm-filter-select"
            style={{ width: 180 }}
            value={sortValue}
            onChange={(e) => {
              const [key, dir] = e.target.value.split('_');
              onSortChange({ key, dir });
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilterBar;
