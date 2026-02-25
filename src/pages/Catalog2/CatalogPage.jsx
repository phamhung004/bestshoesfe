import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CatalogFilterSidebar from './components/CatalogFilterSidebar';
import FilterDrawer from './components/FilterDrawer';
import ActiveFilterChips from './components/ActiveFilterChips';
import CatalogToolbar from './components/CatalogToolbar';
import CatalogProductGrid from './components/CatalogProductGrid';
import CatalogPagination from './components/CatalogPagination';
import QuickViewModal from './components/QuickViewModal';
import {
    PRODUCTS,
    CATEGORIES,
    PRODUCTS_PER_PAGE,
    getMinPrice,
    getActivePromotion,
    getDiscountedPrice,
    isNewProduct,
    getTotalStock,
} from './mockCatalogData';
import './CatalogPage.css';

// ─── Default filter state ──────────────────────────────
const DEFAULT_FILTERS = {
    category: null,
    brands: [],
    priceRange: [0, 5000000],
    sizes: [],
    colors: [],
    materials: [],
    rating: null,
    availability: {
        inStock: false,
        onPromotion: false,
        newArrivals: false,
    },
};

const CatalogPage = () => {
    // ── Filter state ─────────────────────────────────────
    const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid-4');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [toast, setToast] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loadedPages, setLoadedPages] = useState(1);

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // ── Filter logic ─────────────────────────────────────
    const filteredProducts = useMemo(() => {
        let result = PRODUCTS.filter(p => p.status === 1);

        // Category filter (including children)
        if (filters.category) {
            const childCats = CATEGORIES
                .filter(c => c.parent_id === filters.category)
                .map(c => c.category_id);
            const catIds = [filters.category, ...childCats];
            result = result.filter(p => catIds.includes(p.category_id));
        }

        // Brand filter
        if (filters.brands.length > 0) {
            result = result.filter(p => filters.brands.includes(p.brand_id));
        }

        // Price range filter
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) {
            result = result.filter(p => {
                const minPrice = getMinPrice(p);
                return minPrice >= filters.priceRange[0] && minPrice <= filters.priceRange[1];
            });
        }

        // Size filter
        if (filters.sizes.length > 0) {
            result = result.filter(p =>
                p.variants.some(v => filters.sizes.includes(v.size_id) && v.status === 1)
            );
        }

        // Color filter
        if (filters.colors.length > 0) {
            result = result.filter(p =>
                p.variants.some(v => filters.colors.includes(v.color_id) && v.status === 1)
            );
        }

        // Material filter
        if (filters.materials.length > 0) {
            result = result.filter(p => filters.materials.includes(p.material_id));
        }

        // Rating filter
        if (filters.rating) {
            result = result.filter(p => p.rating >= filters.rating);
        }

        // Availability: in-stock
        if (filters.availability.inStock) {
            result = result.filter(p => getTotalStock(p) > 0);
        }

        // Availability: on promotion
        if (filters.availability.onPromotion) {
            result = result.filter(p => getActivePromotion(p) !== null);
        }

        // Availability: new arrivals
        if (filters.availability.newArrivals) {
            result = result.filter(p => isNewProduct(p));
        }

        return result;
    }, [filters]);

    // ── Sort logic ───────────────────────────────────────
    const sortedProducts = useMemo(() => {
        const copy = [...filteredProducts];
        switch (sortBy) {
            case 'newest':
                return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'price_asc':
                return copy.sort((a, b) => getMinPrice(a) - getMinPrice(b));
            case 'price_desc':
                return copy.sort((a, b) => getMinPrice(b) - getMinPrice(a));
            case 'rating':
                return copy.sort((a, b) => b.rating - a.rating);
            case 'bestseller':
                return copy.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
            case 'featured':
            default:
                return copy.sort((a, b) => {
                    if (a.isBestseller && !b.isBestseller) return -1;
                    if (!a.isBestseller && b.isBestseller) return 1;
                    return b.rating - a.rating;
                });
        }
    }, [filteredProducts, sortBy]);

    // ── Pagination ───────────────────────────────────────
    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = sortedProducts.slice(
        0,
        currentPage * PRODUCTS_PER_PAGE
    );
    // For standard pagination mode
    const pageProducts = sortedProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    const displayProducts = pageProducts;
    const startItem = sortedProducts.length > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0;
    const endItem = Math.min(currentPage * PRODUCTS_PER_PAGE, sortedProducts.length);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
        setLoadedPages(1);
    }, [filters, sortBy]);

    // ── Filter change handler ────────────────────────────
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({ ...DEFAULT_FILTERS });
    }, []);

    // Remove a single filter chip
    const handleRemoveFilter = useCallback((key, value) => {
        if (key === 'category') {
            setFilters(prev => ({ ...prev, category: null }));
        } else if (key === 'priceRange') {
            setFilters(prev => ({ ...prev, priceRange: [0, 5000000] }));
        } else if (key === 'rating') {
            setFilters(prev => ({ ...prev, rating: null }));
        } else if (key.startsWith('availability-')) {
            const subKey = key.replace('availability-', '');
            setFilters(prev => ({
                ...prev,
                availability: { ...prev.availability, [subKey]: false },
            }));
        } else {
            // Array-based filters
            setFilters(prev => ({
                ...prev,
                [key]: (prev[key] || []).filter(v => v !== value),
            }));
        }
    }, []);

    // ── Wishlist toggle ──────────────────────────────────
    const handleToggleWishlist = useCallback((productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    // ── Add to cart ──────────────────────────────────────
    const handleAddToCart = useCallback((product, variant, qty = 1) => {
        // Show toast notification
        setToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Breadcrumb data ──────────────────────────────────
    const activeCat = filters.category
        ? CATEGORIES.find(c => c.category_id === filters.category)
        : null;

    const pageTitle = activeCat ? activeCat.name : 'Tất cả sản phẩm';

    // Count active filters for mobile badge
    const activeFilterCount = [
        filters.category ? 1 : 0,
        filters.brands.length,
        filters.sizes.length,
        filters.colors.length,
        filters.materials.length,
        filters.rating ? 1 : 0,
        (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000000) ? 1 : 0,
        filters.availability.inStock ? 1 : 0,
        filters.availability.onPromotion ? 1 : 0,
        filters.availability.newArrivals ? 1 : 0,
    ].reduce((sum, v) => sum + v, 0);

    return (
        <div className="catalog-page">
            {/* ── Breadcrumb + Page Title Bar ─────────────── */}
            <div className="catalog-breadcrumb-bar">
                <div className="catalog-container">
                    <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="catalog-breadcrumb-sep">/</span>
                        <a href="/catalog">Sản phẩm</a>
                        {activeCat && (
                            <>
                                <span className="catalog-breadcrumb-sep">/</span>
                                <span className="catalog-breadcrumb-current">{activeCat.name}</span>
                            </>
                        )}
                    </nav>
                    <h1 className="catalog-page-title">{pageTitle}</h1>
                    <p className="catalog-product-count">
                        Tìm thấy {sortedProducts.length} sản phẩm
                    </p>

                    {/* Active filter chips */}
                    <ActiveFilterChips
                        filters={filters}
                        onRemoveFilter={handleRemoveFilter}
                        onClearAll={handleResetFilters}
                    />
                </div>
            </div>

            {/* ── Main Layout ─────────────────────────────── */}
            <div className="catalog-layout">
                {/* Left filter sidebar (desktop) */}
                <CatalogFilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />

                {/* Main content area */}
                <div className="catalog-main-content">
                    {/* Toolbar */}
                    <CatalogToolbar
                        totalProducts={sortedProducts.length}
                        currentRange={[startItem, endItem]}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewChange={setViewMode}
                    />

                    {/* Product grid */}
                    <CatalogProductGrid
                        products={displayProducts}
                        loading={loading}
                        viewMode={viewMode}
                        onQuickView={(product) => setQuickViewProduct(product)}
                        onAddToCart={handleAddToCart}
                        wishlist={wishlist}
                        onToggleWishlist={handleToggleWishlist}
                        onClearFilters={handleResetFilters}
                        onShowAll={handleResetFilters}
                    />

                    {/* Pagination */}
                    {!loading && sortedProducts.length > 0 && (
                        <CatalogPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalProducts={sortedProducts.length}
                            pageSize={PRODUCTS_PER_PAGE}
                            onPageChange={setCurrentPage}
                            onLoadMore={() => setCurrentPage(prev => prev + 1)}
                        />
                    )}
                </div>
            </div>

            {/* ── Mobile bottom bar ───────────────────────── */}
            <div className="catalog-mobile-bottom-bar">
                <button
                    className="catalog-mobile-filter-btn"
                    onClick={() => setDrawerOpen(true)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                        <circle cx="8" cy="6" r="2" fill="currentColor" /><circle cx="16" cy="12" r="2" fill="currentColor" /><circle cx="10" cy="18" r="2" fill="currentColor" />
                    </svg>
                    Lọc
                    {activeFilterCount > 0 && (
                        <span className="catalog-mobile-filter-badge">{activeFilterCount}</span>
                    )}
                </button>
                <div className="catalog-mobile-sort">
                    <select
                        className="catalog-sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="featured">Nổi bật nhất</option>
                        <option value="newest">Mới nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                        <option value="rating">Đánh giá cao nhất</option>
                        <option value="bestseller">Bán chạy nhất</option>
                    </select>
                </div>
            </div>

            {/* ── Filter Drawer (mobile) ──────────────────── */}
            <FilterDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                filteredCount={sortedProducts.length}
                onApply={() => { }}
            />

            {/* ── Quick View Modal ────────────────────────── */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={handleAddToCart}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                />
            )}

            {/* ── Toast notification ──────────────────────── */}
            {toast && (
                <div className="catalog-toast" key={Date.now()}>
                    <span>✓</span>
                    {toast}
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
