import { useScrollReveal } from '../hooks';
import { BrandSkeleton } from './SkeletonLoaders';

/**
 * Brand Banner — shows brand logos/names from API data.
 *
 * @param {{ brands: Array, loading: boolean }} props
 */
export default function BrandBanner({ brands = [], loading = false }) {
  const ref = useScrollReveal();

  // Display brand names (up to 6)
  const displayBrands = brands.slice(0, 6);

  return (
    <section className="brand-banner">
      <div className="section-container">
        <div className="brand-banner-layout scroll-reveal" ref={ref}>
          <div>
            <h2 className="brand-banner-title">
              <span className="white">{brands.length > 0 ? `${brands.length}+` : '50+'} THƯƠNG HIỆU</span><br />
              <span className="light">CHÍNH HÃNG</span>
            </h2>
            <p className="brand-banner-sub">
              Từ Nike, Adidas, đến Biti's Hunter — tất cả đều 100% authentic.
            </p>
          </div>

          {loading ? (
            <BrandSkeleton />
          ) : (
            <div className="brand-logo-grid">
              {displayBrands.map((b, i) => (
                <div
                  key={b.brandId || i}
                  className="brand-logo-card scroll-reveal-child"
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  {b.logo ? (
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="brand-logo-img"
                      loading="lazy"
                    />
                  ) : (
                    <span className="brand-logo-text">{(b.name || '').toUpperCase()}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
