import { Link } from 'react-router-dom';

/**
 * Hero banner — static marketing content with CTA buttons.
 */
export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-glow" />
      <div className="hero-dot-pattern" />

      <div className="hero-container">
        {/* Left column — text */}
        <div className="hero-content">
          <div className="hero-pill">🔥 BỘ SƯU TẬP MỚI 2026</div>

          <h1 className="hero-headline">
            <span className="line"><span className="white">BƯỚC ĐI</span></span>
            <span className="line"><span className="indigo">TỰ TIN</span></span>
            <span className="line"><span className="white">PHONG CÁCH</span></span>
          </h1>

          <p className="hero-subheading">
            Khám phá hàng nghìn đôi giày chính hãng từ các thương hiệu
            hàng đầu thế giới. Chất lượng đỉnh cao — Giá cả hợp lý.
          </p>

          <div className="hero-cta-row">
            <Link to="/catalog" className="hero-btn-primary">Mua sắm ngay →</Link>
            <Link to="/catalog" className="hero-btn-outline">Xem bộ sưu tập</Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">10,000+</span>
              <span className="hero-stat-label">Sản phẩm</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">50+</span>
              <span className="hero-stat-label">Thương hiệu</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Chính hãng</span>
            </div>
          </div>
        </div>

        {/* Right column — image */}
        <div className="hero-image-area">
          <img
            className="hero-shoe-img"
            src="https://placehold.co/600x800/4338CA/ffffff?text=BestShoes"
            alt="BestShoes Hero"
          />
          <div className="hero-float-badge top-left">
            <div className="hero-badge-title">⭐ 4.9/5</div>
            <div className="hero-badge-sub">12,000+ đánh giá</div>
          </div>
          <div className="hero-float-badge bottom-right">
            <div className="hero-badge-title">🚚 Freeship</div>
            <div className="hero-badge-sub">Đơn từ 500k</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator">
        <span className="hero-scroll-text">Cuộn xuống</span>
        <span className="hero-scroll-chevron">⌄</span>
      </div>
    </section>
  );
}
