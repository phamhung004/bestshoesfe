import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { usePOS } from './POSContext';
import { posAPI } from '../../../../services/api';

/**
 * ProductBrowser — left panel: search, filters, product grid.
 * Loads products from real API.
 */
const ProductBrowser = ({ onAddToCart, pulseProductId, onProductClick }) => {
    const { categories, brands, sizes, colors, loading: refLoading } = usePOS();

    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState(null);   // null = all
    const [activeBrand, setActiveBrand] = useState(null);
    const [activeSize, setActiveSize] = useState(null);
    const [activeColor, setActiveColor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <input
                    type="text"
                    placeholder="Tìm sản phẩm theo tên, mã SKU..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Tìm kiếm sản phẩm"
                />
                <button className="pos-barcode-btn" aria-label="Quét mã vạch" title="Quét mã vạch (sắp ra mắt)">
                    📷
                </button>
            </div>

            {/* Filter row */}
            <div className="pos-filter-row">
                {/* Category pills */}
                <div className="pos-category-tabs">
                    <button
                        className={`pos-cat-pill${!activeCat ? ' active' : ''}`}
                        onClick={() => setActiveCat(null)}
                    >
                        Tất cả
                    </button>
                    {categories.map(c => (
                        <button
                            key={c.categoryId}
                            className={`pos-cat-pill${activeCat === c.categoryId ? ' active' : ''}`}
                            onClick={() => setActiveCat(activeCat === c.categoryId ? null : c.categoryId)}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

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

                {/* Size chips */}
                <div className="pos-size-chips">
                    <button
                        className={`pos-size-chip${!activeSize ? ' active' : ''}`}
                        onClick={() => setActiveSize(null)}
                    >
                        Tất cả
                    </button>
                    {sizes.map(s => (
                        <button
                            key={s.sizeId}
                            className={`pos-size-chip${activeSize === s.sizeId ? ' active' : ''}`}
                            onClick={() => setActiveSize(activeSize === s.sizeId ? null : s.sizeId)}
                        >
                            {s.sizeName}
                        </button>
                    ))}
                </div>

                <div className="pos-filter-sep" />

                {/* Color dot filters */}
                <div className="pos-color-dots">
                    {Array.isArray(colors) && colors.map(c => (
                        <button
                            key={c.colorId}
                            className={`pos-color-dot-filter${activeColor === c.colorId ? ' active' : ''}`}
                            style={{ background: c.colorCode }}
                            onClick={() => setActiveColor(activeColor === c.colorId ? null : c.colorId)}
                            aria-label={`Lọc màu ${c.colorName}`}
                            title={c.colorName}
                        />
                    ))}
                </div>
            </div>

            {/* Product grid */}
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
                        <div className="icon">🔍</div>
                        <h3>Không tìm thấy sản phẩm</h3>
                        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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
