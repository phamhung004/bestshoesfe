import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks';
import CatalogProductCard from '../../Catalog2/components/CatalogProductCard';
import { ProductCardSkeleton } from './SkeletonLoaders';
import { useWishlist } from '../../../context/WishlistContext';

/**
 * Best Sellers Section — shows popular products with brand filter tabs.
 * Uses CatalogProductCard which expects ProductSummaryDTO shape from API.
 *
 * @param {{ products: Array, brands: Array, loading: boolean }} props
 */
export default function BestSellersSection({ products = [], brands = [], loading = false }) {
  // Build brand tabs dynamically from loaded brands
  const tabs = [
    { label: 'Tất cả', brandName: null },
    ...brands
      .filter(b => {
        // Only show brands that exist in the product list
        return products.some(p => p.brandName === b.name);
      })
      .slice(0, 5)
      .map(b => ({ label: b.name, brandName: b.name })),
  ];

  const [activeTab, setActiveTab] = useState(null);
  const [fading, setFading] = useState(false);
  const { wishlistArray, toggleWishlist } = useWishlist();

  const filteredProducts = activeTab
    ? products.filter(p => p.brandName === activeTab)
    : products;

  const handleTabChange = useCallback((brandName) => {
    setFading(true);
    setTimeout(() => {
      setActiveTab(brandName);
      setFading(false);
    }, 150);
  }, []);

  const ref = useScrollReveal();

  return (
    <section className="best-sellers-section">
      <div className="section-container">
        <div className="section-header scroll-reveal" ref={ref}>
          <div className="section-eyebrow">BÁN CHẠY NHẤT</div>
          <h2 className="section-title">Được yêu thích nhất</h2>
          <p className="section-subtitle">
            Những đôi giày được hàng nghìn khách hàng tin chọn
          </p>
        </div>

        {!loading && tabs.length > 1 && (
          <div className="brand-filter-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`brand-tab ${activeTab === tab.brandName ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.brandName)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <ProductCardSkeleton count={4} />
        ) : (
          <div className={`best-sellers-grid ${fading ? 'fading' : ''}`}>
            {filteredProducts.map((product) => (
              <CatalogProductCard
                key={product.productId}
                product={product}
                viewMode="grid"
                onQuickView={() => {}}
                onAddToCart={() => {}}
                wishlist={wishlistArray}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}

        <div className="best-sellers-more">
          <Link to="/catalog" className="best-sellers-more-btn">
            Xem tất cả sản phẩm →
          </Link>
        </div>
      </div>
    </section>
  );
}
