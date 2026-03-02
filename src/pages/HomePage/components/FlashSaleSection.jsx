import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks';
import { formatVND } from '../../../utils/formatPrice';
import { FlashSaleSkeleton } from './SkeletonLoaders';

/* ─── Countdown Timer ─── */
function CountdownTimer({ endDate }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const [flipping, setFlipping] = useState({});

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = endDate ? new Date(endDate) : new Date(now);
      if (!endDate) {
        end.setHours(23, 59, 59, 999);
      }
      const diff = Math.max(0, end - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTime(prev => {
        const newFlip = {};
        if (prev.h !== h) newFlip.h = true;
        if (prev.m !== m) newFlip.m = true;
        if (prev.s !== s) newFlip.s = true;
        if (Object.keys(newFlip).length > 0) {
          setFlipping(newFlip);
          setTimeout(() => setFlipping({}), 200);
        }
        return { h, m, s };
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="countdown-timer">
      <div className="countdown-unit">
        <div className={`countdown-number ${flipping.h ? 'flip' : ''}`}>{pad(time.h)}</div>
        <span className="countdown-label">Giờ</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <div className={`countdown-number ${flipping.m ? 'flip' : ''}`}>{pad(time.m)}</div>
        <span className="countdown-label">Phút</span>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <div className={`countdown-number ${flipping.s ? 'flip' : ''}`}>{pad(time.s)}</div>
        <span className="countdown-label">Giây</span>
      </div>
    </div>
  );
}

/* ─── Flash Sale Card ─── */
function FlashSaleCard({ product, delay }) {
  const {
    name = '',
    brandName = '',
    minPrice = 0,
    promotionalPrice,
    discountPercentage,
    primaryImageUrl,
    productId,
  } = product;

  const hasPromo = promotionalPrice != null && promotionalPrice < minPrice;
  const salePrice = hasPromo ? promotionalPrice : minPrice;
  const discount = discountPercentage ? Math.round(discountPercentage) : 0;

  return (
    <Link
      to={`/products/${productId}`}
      className="flash-card scroll-reveal-child"
      style={{ transitionDelay: `${delay * 0.1}s` }}
    >
      <div className="flash-card-img-wrap">
        {primaryImageUrl ? (
          <img src={primaryImageUrl} alt={name} loading="lazy" />
        ) : (
          <div className="flash-card-img-placeholder">👟</div>
        )}
        <div className="flash-card-badges">
          {discount > 0 && <span className="flash-badge-discount">−{discount}%</span>}
          <span className="flash-badge-label">Flash Sale</span>
        </div>
      </div>
      <div className="flash-card-body">
        <div className="flash-card-brand">{brandName}</div>
        <h4 className="flash-card-name">{name}</h4>
        <div className="flash-card-price">
          <span className="flash-price-sale">{formatVND(salePrice)}</span>
          {hasPromo && <span className="flash-price-original">{formatVND(minPrice)}</span>}
        </div>
        <button className="flash-card-btn" onClick={(e) => e.preventDefault()}>Mua ngay</button>
      </div>
    </Link>
  );
}

/**
 * Flash Sale Section — shows on-sale products from the API.
 *
 * @param {{ products: Array, promotions: Array, loading: boolean }} props
 */
export default function FlashSaleSection({ products = [], promotions = [], loading = false }) {
  const ref = useScrollReveal();

  // Get the first currently running promotion for the countdown
  const activePromotion = promotions[0] || null;
  const endDate = activePromotion?.endDate || null;

  // Don't render if no sale products and not loading
  if (!loading && products.length === 0) return null;

  return (
    <section className="flash-sale-section">
      <div className="section-container">
        <div className="flash-sale-layout scroll-reveal" ref={ref}>
          <div className="flash-sale-header">
            <div className="section-eyebrow flash-sale-eyebrow">⚡ FLASH SALE</div>
            <h2 className="flash-sale-title">
              <span className="white">Ưu đãi có</span><br />
              <span className="indigo">hạn hôm nay</span>
            </h2>
            <p className="flash-sale-subtitle">
              Giảm giá cực sốc — số lượng có hạn. Nhanh tay kẻo hết!
            </p>
            <CountdownTimer endDate={endDate} />
            <Link to="/catalog?onSale=true" className="flash-sale-view-all">Xem tất cả ưu đãi →</Link>
          </div>

          <div className="flash-sale-cards">
            {loading ? (
              <FlashSaleSkeleton />
            ) : (
              products.slice(0, 4).map((p, i) => (
                <FlashSaleCard key={p.productId || i} product={p} delay={i} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
