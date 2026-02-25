import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { products, categories, brands, sizes, colors, getBrandName, getCategoryName } from './mockPOSData';

/**
 * ProductBrowser — left panel: search, filters, product grid.
 */
const ProductBrowser = ({ onAddToCart, pulseProductId, onProductClick }) => {
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState(null);   // null = all
    const [activeBrand, setActiveBrand] = useState(null);
    const [activeSize, setActiveSize] = useState(null);
    const [activeColor, setActiveColor] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulate initial loading
    React.useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    // Filter products
    const filtered = useMemo(() => {
        return products.filter(p => {
            if (p.status !== 1) return false;
            // Search by name
            if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
            // Category filter
            if (activeCat && p.category_id !== activeCat) return false;
            // Brand filter
            if (activeBrand && p.brand_id !== activeBrand) return false;
            // Size filter — product must have a variant with this size
            if (activeSize) {
                const hasSize = p.variants.some(v => v.size_id === activeSize && v.status === 1);
                if (!hasSize) return false;
            }
            // Color filter
            if (activeColor) {
                const hasColor = p.variants.some(v => v.color_id === activeColor && v.status === 1);
                if (!hasColor) return false;
            }
            return true;
        });
    }, [search, activeCat, activeBrand, activeSize, activeColor]);

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
                            key={c.category_id}
                            className={`pos-cat-pill${activeCat === c.category_id ? ' active' : ''}`}
                            onClick={() => setActiveCat(activeCat === c.category_id ? null : c.category_id)}
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
                        <option key={b.brand_id} value={b.brand_id}>{b.name}</option>
                    ))}
                </select>

                <div className="pos-filter-sep" />

                {/* Size chips */}
                <div className="pos-size-chips">
                    <button
                        className={`pos-size-chip${!activeSize ? ' active' : ''}`}
                        onClick={() => setActiveSize(null)}
                    >
                        All
                    </button>
                    {sizes.map(s => (
                        <button
                            key={s.size_id}
                            className={`pos-size-chip${activeSize === s.size_id ? ' active' : ''}`}
                            onClick={() => setActiveSize(activeSize === s.size_id ? null : s.size_id)}
                        >
                            {s.size_name}
                        </button>
                    ))}
                </div>

                <div className="pos-filter-sep" />

                {/* Color dot filters */}
                <div className="pos-color-dots">
                    {Array.isArray(colors) && colors.map(c => (
                        <button
                            key={c.color_id}
                            className={`pos-color-dot-filter${activeColor === c.color_id ? ' active' : ''}`}
                            style={{ background: c.color_code }}
                            onClick={() => setActiveColor(activeColor === c.color_id ? null : c.color_id)}
                            aria-label={`Lọc màu ${c.color_name}`}
                            title={c.color_name}
                        />
                    ))}
                </div>
            </div>

            {/* Product grid */}
            <div className="pos-product-grid-wrap">
                {loading ? (
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
                                key={p.product_id}
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
