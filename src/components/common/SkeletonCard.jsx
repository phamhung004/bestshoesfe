import React from 'react';

/**
 * SkeletonCard — animated placeholder matching CatalogProductCard dimensions.
 * Used during initial product grid loading.
 */
const SkeletonCard = () => (
  <div className="catalog-card" aria-hidden="true" style={{ pointerEvents: 'none' }}>
    {/* Image area */}
    <div
      className="catalog-card-image-wrap"
      style={{
        background: '#e5e7eb',
        borderRadius: '8px',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        minHeight: '260px',
      }}
    />

    {/* Body */}
    <div className="catalog-card-body" style={{ padding: '12px' }}>
      {/* Brand line */}
      <div style={skeletonLine('40%', '10px', '4px')} />
      {/* Title */}
      <div style={skeletonLine('80%', '14px', '6px')} />
      <div style={skeletonLine('60%', '14px', '2px')} />
      {/* Rating */}
      <div style={skeletonLine('50%', '10px', '8px')} />
      {/* Price */}
      <div style={skeletonLine('45%', '16px', '8px')} />
      {/* Colors */}
      <div style={{ display: 'flex', gap: '6px', margin: '8px 0' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 20, height: 20, borderRadius: '50%',
              background: '#d1d5db',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
      {/* Button */}
      <div
        style={{
          height: 36, borderRadius: 6,
          background: '#d1d5db',
          animation: 'skeleton-pulse 1.5s ease-in-out infinite',
          marginTop: 6,
        }}
      />
    </div>

    <style>{`
      @keyframes skeleton-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `}</style>
  </div>
);

function skeletonLine(width, height, marginTop) {
  return {
    width,
    height,
    borderRadius: 4,
    background: '#d1d5db',
    marginTop,
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  };
}

export default SkeletonCard;
