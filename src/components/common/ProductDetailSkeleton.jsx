import React from 'react';

/**
 * ProductDetailSkeleton — animated placeholder for the Product Detail page.
 * Matches the layout so there's no layout shift when data arrives.
 */
const ProductDetailSkeleton = () => (
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
    {/* Breadcrumb */}
    <div style={line('30%', '12px', '0 0 24px')} />

    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
      {/* Left: Gallery */}
      <div style={{ flex: '1 1 380px', minWidth: 280 }}>
        {/* Main image */}
        <div style={box('100%', 400)} />
        {/* Thumbnails */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={box(80, 80)} />
          ))}
        </div>
      </div>

      {/* Right: Info */}
      <div style={{ flex: '1 1 340px', minWidth: 280 }}>
        {/* Category */}
        <div style={line('25%', '12px', '0 0 8px')} />
        {/* Name */}
        <div style={line('80%', '28px', '0 0 8px')} />
        <div style={line('60%', '28px', '0 0 16px')} />
        {/* Rating */}
        <div style={line('35%', '14px', '0 0 16px')} />
        {/* Price */}
        <div style={line('40%', '32px', '0 0 24px')} />
        {/* Colors label */}
        <div style={line('20%', '14px', '0 0 10px')} />
        {/* Color dots */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#d1d5db',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
        {/* Sizes label */}
        <div style={line('15%', '14px', '0 0 10px')} />
        {/* Size chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 48, height: 36, borderRadius: 6,
                background: '#d1d5db',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
        {/* Add to cart button */}
        <div style={{ height: 48, borderRadius: 8, background: '#c7d2fe', ...anim(), marginBottom: 12 }} />
        {/* Highlights */}
        <div style={line('70%', '13px', '0 0 6px')} />
        <div style={line('55%', '13px', '0 0 6px')} />
        <div style={line('65%', '13px', '0 0 6px')} />
      </div>
    </div>

    <style>{`
      @keyframes skeleton-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `}</style>
  </div>
);

function anim() {
  return { animation: 'skeleton-pulse 1.5s ease-in-out infinite' };
}

function line(width, height, margin) {
  return {
    width, height,
    borderRadius: 4,
    background: '#d1d5db',
    margin,
    ...anim(),
  };
}

function box(width, height) {
  return {
    width: typeof width === 'number' ? width : width,
    height,
    borderRadius: 8,
    background: '#e5e7eb',
    ...anim(),
  };
}

export default ProductDetailSkeleton;
