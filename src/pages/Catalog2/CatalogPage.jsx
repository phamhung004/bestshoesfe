import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CatalogFilterSidebar from './components/CatalogFilterSidebar';
import FilterDrawer from './components/FilterDrawer';
import ActiveFilterChips from './components/ActiveFilterChips';
import CatalogToolbar from './components/CatalogToolbar';
import CatalogProductGrid from './components/CatalogProductGrid';
import CatalogPagination from './components/CatalogPagination';
import ErrorState from '../../components/common/ErrorState';
import { useProducts } from '../../hooks/useProducts';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import './CatalogPage.css';

const CatalogPage = () => {
    const navigate = useNavigate();

    // ── Real API hooks ────────────────────────────────────
    const {
        filters,
        products,
        loading,
        error,
        totalPages,
        totalElements,
        currentPage,
        updateFilter,
        resetFilters,
        activeFilterCount,
    } = useProducts();

    const { options: filterOptions, loading: filtersLoading } = useFilterOptions();

    // ── Local UI state ────────────────────────────────────
    const [viewMode, setViewMode] = useState('grid-4');
    const [wishlist, setWishlist] = useState([]);
    const [toast, setToast] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // ── Handlers ─────────────────────────────────────────
    const handleFilterChange = useCallback((key, value) => {
        updateFilter(key, value);
    }, [updateFilter]);

    const handleResetFilters = useCallback(() => {
        resetFilters();
    }, [resetFilters]);

    const handleRemoveFilter = useCallback((key) => {
        updateFilter(key, undefined);
    }, [updateFilter]);

    const handleToggleWishlist = useCallback((productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    const handleAddToCart = useCallback((product) => {
        setToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
        setTimeout(() => setToast(null), 3000);
    }, []);

    const handleQuickView = useCallback((product) => {
        navigate(`/products/${product.productId}`);
    }, [navigate]);

    // ── Breadcrumb title from active category ─────────────
    const activeCatName = filters.categoryId && filterOptions?.categories
        ? filterOptions.categories.find(c => c.categoryId === filters.categoryId)?.name
        : null;
    const pageTitle = activeCatName ?? 'Tất cả sản phẩm';

    // Range display for toolbar
    const pageSize = filters.size ?? 12;
    const startItem = totalElements > 0 ? currentPage * pageSize + 1 : 0;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <div className="catalog-page">
            {/* ── Breadcrumb + Page Title Bar ─────────────── */}
            <div className="catalog-breadcrumb-bar">
                <div className="catalog-container">
                    <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="catalog-breadcrumb-sep">/</span>
                        <a href="/catalog">Sản phẩm</a>
                        {activeCatName && (
                            <>
                                <span className="catalog-breadcrumb-sep">/</span>
                                <span className="catalog-breadcrumb-current">{activeCatName}</span>
                            </>
                        )}
                    </nav>
                    <h1 className="catalog-page-title">{pageTitle}</h1>
                    <p className="catalog-product-count">
                        {loading ? 'Đang tải...' : `Tìm thấy ${totalElements} sản phẩm`}
                    </p>

                    {/* Active filter chips */}
                    <ActiveFilterChips
                        filters={filters}
                        filterOptions={filterOptions}
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
                    filterOptions={filterOptions}
                    filterOptionsLoading={filtersLoading}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />

                {/* Main content area */}
                <div className="catalog-main-content">
                    {/* Toolbar */}
                    <CatalogToolbar
                        totalProducts={totalElements}
                        currentRange={[startItem, endItem]}
                        sortBy={filters.sortBy ?? 'newest'}
                        onSortChange={(val) => updateFilter('sortBy', val)}
                        viewMode={viewMode}
                        onViewChange={setViewMode}
                    />

                    {/* Error state */}
                    {error && !loading && (
                        <ErrorState
                            message={error}
                            onRetry={() => updateFilter('page', currentPage)}
                        />
                    )}

                    {/* Product grid */}
                    {!error && (
                        <div style={{ position: 'relative' }}>
                            {/* Overlay spinner during filter changes (when data already exists) */}
                            {loading && products.length > 0 && (
                                <div style={{
                                    position: 'absolute', inset: 0, zIndex: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.6)',
                                }}>
                                    <div style={{
                                        width: 40, height: 40, border: '3px solid #e0e7ff',
                                        borderTop: '3px solid #4f46e5', borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                </div>
                            )}
                            <div style={{ opacity: loading && products.length > 0 ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                <CatalogProductGrid
                                    products={products}
                                    loading={loading && products.length === 0}
                                    viewMode={viewMode}
                                    onQuickView={handleQuickView}
                                    onAddToCart={handleAddToCart}
                                    wishlist={wishlist}
                                    onToggleWishlist={handleToggleWishlist}
                                    onClearFilters={handleResetFilters}
                                    onShowAll={handleResetFilters}
                                />
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalElements > 0 && (
                        <CatalogPagination
                            currentPage={currentPage + 1}
                            totalPages={totalPages}
                            totalProducts={totalElements}
                            pageSize={pageSize}
                            onPageChange={(p) => updateFilter('page', p - 1)}
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
                        value={filters.sortBy ?? 'newest'}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="popular">Phổ biến nhất</option>
                        <option value="price_asc">Giá tăng dần</option>
                        <option value="price_desc">Giá giảm dần</option>
                    </select>
                </div>
            </div>

            {/* ── Filter Drawer (mobile) ──────────────────── */}
            <FilterDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                filteredCount={totalElements}
                onApply={() => setDrawerOpen(false)}
            />

            {/* ── Toast notification ──────────────────────── */}
            {toast && (
                <div className="catalog-toast">
                    <span>✓</span>
                    {toast}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CatalogPage;
