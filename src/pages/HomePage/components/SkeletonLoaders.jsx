/**
 * Skeleton loaders for homepage sections.
 * Shows shimmer placeholders while API data is loading.
 */

export function CategorySkeleton() {
  return (
    <div className="category-grid">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`category-card skeleton-card ${i === 0 ? 'tall' : ''} ${i === 3 ? 'wide' : ''}`}
        >
          <div className="skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function ProductCardSkeleton({ count = 4 }) {
  return (
    <div className="best-sellers-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-product-card">
          <div className="skeleton-product-img skeleton-shimmer" />
          <div className="skeleton-product-body">
            <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: 12 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '80%', height: 16, marginTop: 8 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: 12, marginTop: 8 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '50%', height: 20, marginTop: 12 }} />
            <div className="skeleton-colors">
              {[0, 1, 2].map(j => (
                <div key={j} className="skeleton-color-dot skeleton-shimmer" />
              ))}
            </div>
            <div className="skeleton-line skeleton-shimmer skeleton-btn" style={{ width: '100%', height: 36, marginTop: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlashSaleSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flash-card skeleton-flash-card">
          <div className="skeleton-flash-img skeleton-shimmer" />
          <div className="skeleton-flash-body">
            <div className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: 10 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '70%', height: 14, marginTop: 6 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '50%', height: 16, marginTop: 8 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: '100%', height: 32, marginTop: 10, borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </>
  );
}

export function BrandSkeleton() {
  return (
    <div className="brand-logo-grid">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div key={i} className="brand-logo-card skeleton-brand-card">
          <div className="skeleton-shimmer" style={{ width: '70%', height: 20, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}
