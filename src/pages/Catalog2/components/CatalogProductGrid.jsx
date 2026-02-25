import React from 'react';
import CatalogProductCard from './CatalogProductCard';
import SkeletonCard from './SkeletonCard';
import EmptyState from './EmptyState';

const CatalogProductGrid = ({
    products,
    loading,
    viewMode,
    onQuickView,
    onAddToCart,
    wishlist,
    onToggleWishlist,
    onClearFilters,
    onShowAll,
}) => {
    // Grid class based on view mode
    const gridClass = viewMode === 'grid-2'
        ? 'catalog-product-grid cols-2'
        : viewMode === 'list'
            ? 'catalog-product-grid cols-list'
            : 'catalog-product-grid';

    // Loading skeleton
    if (loading) {
        return (
            <div className={gridClass}>
                {Array.from({ length: 8 }, (_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (products.length === 0) {
        return <EmptyState onClearFilters={onClearFilters} onShowAll={onShowAll} />;
    }

    return (
        <div className={gridClass}>
            {products.map(product => (
                <CatalogProductCard
                    key={product.product_id}
                    product={product}
                    viewMode={viewMode}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                    wishlist={wishlist}
                    onToggleWishlist={onToggleWishlist}
                />
            ))}
        </div>
    );
};

export default CatalogProductGrid;
