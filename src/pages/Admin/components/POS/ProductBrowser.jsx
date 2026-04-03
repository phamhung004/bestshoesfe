import React, { useState, useEffect, useCallback } from 'react';
import { Search, ScanBarcode, X, LayoutGrid, List } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductListItem from './ProductListItem';
import { usePOS } from './POSContext';
import { posAPI } from '../../../../services/api';

/**
 * ProductBrowser — left panel: search, filters, product grid.
 * Loads products from real API.
 */
const ProductBrowser = ({ onAddToCart, pulseProductId, onProductClick, searchInputRef }) => {
    const { categories, brands, sizes, colors, loading: refLoading } = usePOS();

    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState(null);   // null = all
    const [activeBrand, setActiveBrand] = useState(null);
    const [activeSize, setActiveSize] = useState(null);
    const [activeColor, setActiveColor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('pos-view-mode') || 'grid');

    const toggleViewMode = () => {
        const next = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(next);
        localStorage.setItem('pos-view-mode', next);
    };

    const hasActiveFilters = activeCat || activeBrand || activeSize || activeColor;
    const clearAllFilters = () => { setActiveCat(null); setActiveBrand(null); setActiveSize(null); setActiveColor(null); setSearch(''); };

    // Fetch products from backend whenever search/category/brand changes
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (activeCat) params.categoryId = activeCat;
            if (activeBrand) params.brandId = activeBrand;
            const res = await posAPI.getProducts(params);
            setProducts(res.data || []);
        } catch (err) {
            console.error('Failed to load POS products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [search, activeCat, activeBrand]);

    // Debounce search, immediate for filter changes
    useEffect(() => {
        const timer = setTimeout(fetchProducts, search ? 400 : 0);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    // Client-side filtering for size/color (backend already returns active variants)
    const filtered = products.filter(p => {
        if (activeSize) {
            const hasSize = p.variants.some(v => v.sizeId === activeSize && v.status === 'ACTIVE');
            if (!hasSize) return false;
        }
        if (activeColor) {
            const hasColor = p.variants.some(v => v.colorId === activeColor && v.status === 'ACTIVE');
            if (!hasColor) return false;
        }
        return true;
    });

    return (
        <div className="pos-left-panel">
            {/* Search bar */}
            <div className="pos-search-bar">
                <Search size={18} className="pos-search-icon" />
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Tìm sản phẩm theo tên, mã SKU... (F1)"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Tìm kiếm sản phẩm"
                />
                <button className="pos-barcode-btn" aria-label="Quét mã vạch" title="Quét mã vạch (sắp ra mắt)">
                    <ScanBarcode size={18} />
                </button>
                {/* View mode toggle */}
                <button className="pos-view-toggle" onClick={toggleViewMode} title={viewMode === 'grid' ? 'Chuyển sang danh sách' : 'Chuyển sang lưới'}>
                    {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
                </button>
            </div>

            {/* Filter row */}
            <div className="pos-filter-row">
                {/* Category dropdown */}
                <select
                    className="pos-brand-select"
                    value={activeCat || ''}
                    onChange={e => setActiveCat(e.target.value ? Number(e.target.value) : null)}
                    aria-label="Lọc theo danh mục"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(c => (
                        <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                    ))}
                </select>

                <div className="pos-filter-sep" />

                {/* Brand dropdown */}
                <select
                    className="pos-brand-select"
                    value={activeBrand || ''}
                    onChange={e => setActiveBrand(e.target.value ? Number(e.target.value) : null)}
                    aria-label="Lọc theo thương hiệu"
                >
                    <option value="">Tất cả thương hiệu</option>
                    {brands.map(b => (
                        <option key={b.brandId} value={b.brandId}>{b.name}</option>
                    ))}
                </select>

                <div className="pos-filter-sep" />

                {/* Size dropdown */}
                <select
                    className="pos-brand-select"
                    value={activeSize || ''}
                    onChange={e => setActiveSize(e.target.value ? Number(e.target.value) : null)}
                    aria-label="Lọc theo size"
                >
                    <option value="">Tất cả size</option>
                    {sizes.map(s => (
                        <option key={s.sizeId} value={s.sizeId}>{s.sizeName}</option>
                    ))}
                </select>

                <div className="pos-filter-sep" />

                {/* Color dropdown */}
                <select
                    className="pos-brand-select"
                    value={activeColor || ''}
                    onChange={e => setActiveColor(e.target.value ? Number(e.target.value) : null)}
                    aria-label="Lọc theo màu"
                >
                    <option value="">Tất cả màu</option>
                    {Array.isArray(colors) && colors.map(c => (
                        <option key={c.colorId} value={c.colorId}>{c.colorName}</option>
                    ))}
                </select>

                {/* Clear filters button */}
                {hasActiveFilters && (
                    <button className="pos-clear-filters" onClick={clearAllFilters}>
                        <X size={12} /> Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Product grid or list */}
            <div className="pos-product-grid-wrap">
                {loading || refLoading ? (
                    <div className="pos-product-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="pos-skeleton-card">
                                <div className="pos-skeleton-img" />
                                <div className="pos-skeleton-body">
                                    <div className="pos-skeleton-line medium" />
                                    <div className="pos-skeleton-line short" />
                                    <div className="pos-skeleton-line short" />
                                    <div className="pos-skeleton-btn" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="pos-empty-state">
                        <Search size={40} strokeWidth={1.5} />
                        <h3>Không tìm thấy sản phẩm</h3>
                        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="pos-product-list">
                        {filtered.map(p => (
                            <ProductListItem
                                key={p.productId}
                                product={p}
                                onCardClick={onProductClick}
                                onQuickAdd={onAddToCart}
                                pulseId={pulseProductId}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="pos-product-grid">
                        {filtered.map(p => (
                            <ProductCard
                                key={p.productId}
                                product={p}
                                onCardClick={onProductClick}
                                onQuickAdd={onAddToCart}
                                pulseId={pulseProductId}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal is rendered from parent (POSPage) to keep state clean */}
        </div>
    );
};

export default ProductBrowser;
