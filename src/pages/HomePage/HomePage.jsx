import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CatalogProductCard from '../Catalog2/components/CatalogProductCard';
import {
    PRODUCTS, BRANDS,
    formatVND, getMinPrice, getPrimaryImage, getActivePromotion, getDiscountedPrice,
} from '../Catalog2/mockCatalogData';
import './HomePage.css';

/* ═══════════════════════════════════════════════════════
   Scroll Reveal Hook
   ═══════════════════════════════════════════════════════ */
function useScrollReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // stagger children
                        const children = entry.target.querySelectorAll('.scroll-reveal-child');
                        children.forEach((child, i) => {
                            setTimeout(() => child.classList.add('visible'), i * 100);
                        });
                    }
                });
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return ref;
}

/* ═══════════════════════════════════════════════════════
   SECTION 1 — HERO BANNER
   ═══════════════════════════════════════════════════════ */
function HeroSection() {
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

/* ═══════════════════════════════════════════════════════
   SECTION 2 — TRUST BAR
   ═══════════════════════════════════════════════════════ */
function TrustBar() {
    const items = [
        { icon: '🚚', title: 'Miễn phí vận chuyển', sub: 'Đơn từ 500.000 ₫' },
        { icon: '🔄', title: 'Đổi trả dễ dàng', sub: 'Trong vòng 7 ngày' },
        { icon: '✅', title: 'Hàng chính hãng 100%', sub: 'Cam kết từ thương hiệu' },
        { icon: '🛡', title: 'Bảo hành 12 tháng', sub: 'Cho tất cả sản phẩm' },
    ];
    const ref = useScrollReveal();
    return (
        <section className="trust-bar">
            <div className="trust-bar-container scroll-reveal" ref={ref}>
                {items.map((item, i) => (
                    <div className="trust-item scroll-reveal-child" key={i}>
                        <span className="trust-icon">{item.icon}</span>
                        <div>
                            <div className="trust-text-title">{item.title}</div>
                            <div className="trust-text-sub">{item.sub}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION 3 — FEATURED CATEGORIES
   ═══════════════════════════════════════════════════════ */
function FeaturedCategories() {
    const categories = [
        { name: 'Giày chạy bộ', count: 24, gradient: 'linear-gradient(135deg, #2563EB, #312E81)', img: 'https://placehold.co/500x600/2563EB/ffffff?text=Running', className: 'tall' },
        { name: 'Sneaker', count: 18, gradient: 'linear-gradient(135deg, #9333EA, #EC4899)', img: 'https://placehold.co/500x300/9333EA/ffffff?text=Sneaker', className: '' },
        { name: 'Giày da công sở', count: 12, gradient: 'linear-gradient(135deg, #374151, #111827)', img: 'https://placehold.co/500x300/374151/ffffff?text=Leather', className: '' },
        { name: 'Dép & Sandal', count: 15, gradient: 'linear-gradient(135deg, #FB923C, #EF4444)', img: 'https://placehold.co/800x300/FB923C/ffffff?text=Sandals', className: 'wide' },
    ];
    const ref = useScrollReveal();
    return (
        <section className="featured-categories">
            <div className="section-container">
                <div className="section-header scroll-reveal" ref={ref}>
                    <div className="section-eyebrow">DANH MỤC</div>
                    <h2 className="section-title">
                        Tìm đôi giày<br />phù hợp với bạn
                    </h2>
                    <p className="section-subtitle">
                        Từ giày thể thao đến giày công sở — chúng tôi có tất cả.
                    </p>
                </div>
                <div className="category-grid">
                    {categories.map((cat, i) => (
                        <CategoryCard key={i} {...cat} delay={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CategoryCard({ name, count, gradient, img, className, delay }) {
    const ref = useScrollReveal();
    return (
        <div className={`category-card ${className} scroll-reveal`} ref={ref} style={{ transitionDelay: `${delay * 0.1}s` }}>
            <img className="category-card-bg" src={img} alt={name} style={{ background: gradient }} />
            <div className="category-card-overlay" />
            <div className="category-card-content">
                <h3 className="category-card-name">{name}</h3>
                <div className="category-card-count">{count} sản phẩm</div>
                <span className="category-card-link">
                    Xem ngay <span className="arrow">→</span>
                </span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION 4 — FLASH SALE
   ═══════════════════════════════════════════════════════ */
function CountdownTimer() {
    const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
    const [flipping, setFlipping] = useState({});

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            const diff = Math.max(0, endOfDay - now);
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
    }, []);

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

function FlashSaleSection() {
    const flashProducts = [
        { name: 'Nike Air Max 270', brand: 'Nike', salePrice: 2560000, originalPrice: 3200000, discount: 20, sold: 73, img: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Air+Max+270' },
        { name: 'Adidas Ultraboost', brand: 'Adidas', salePrice: 2640000, originalPrice: 3300000, discount: 20, sold: 58, img: 'https://placehold.co/400x400/000000/FFFFFF?text=Ultraboost' },
        { name: 'Vans Old Skool', brand: 'Vans', salePrice: 1110000, originalPrice: 1850000, discount: 40, sold: 89, img: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Old+Skool' },
        { name: 'Converse Chuck Taylor', brand: 'Converse', salePrice: 870000, originalPrice: 1450000, discount: 40, sold: 45, img: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Chuck+Taylor' },
    ];

    const ref = useScrollReveal();

    return (
        <section className="flash-sale-section">
            <div className="section-container">
                <div className="flash-sale-layout scroll-reveal" ref={ref}>
                    <div className="flash-sale-header">
                        <div className="section-eyebrow">⚡ FLASH SALE</div>
                        <h2 className="flash-sale-title">
                            <span className="white">Ưu đãi có</span><br />
                            <span className="indigo">hạn hôm nay</span>
                        </h2>
                        <p className="flash-sale-subtitle">
                            Giảm giá cực sốc — số lượng có hạn. Nhanh tay kẻo hết!
                        </p>
                        <CountdownTimer />
                        <Link to="/catalog" className="flash-sale-view-all">Xem tất cả ưu đãi →</Link>
                    </div>

                    <div className="flash-sale-cards">
                        {flashProducts.map((p, i) => (
                            <FlashSaleCard key={i} product={p} delay={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FlashSaleCard({ product, delay }) {
    const remaining = 100 - product.sold;
    return (
        <div className="flash-card scroll-reveal-child" style={{ transitionDelay: `${delay * 0.1}s` }}>
            <div className="flash-card-img-wrap">
                <img src={product.img} alt={product.name} />
                <div className="flash-card-badges">
                    <span className="flash-badge-discount">−{product.discount}%</span>
                    <span className="flash-badge-label">Flash Sale</span>
                </div>
            </div>
            <div className="flash-card-body">
                <div className="flash-card-brand">{product.brand}</div>
                <h4 className="flash-card-name">{product.name}</h4>
                <div className="flash-card-price">
                    <span className="flash-price-sale">{formatVND(product.salePrice)}</span>
                    <span className="flash-price-original">{formatVND(product.originalPrice)}</span>
                </div>
                <div className="flash-progress-bar">
                    <div className="flash-progress-track">
                        <div className="flash-progress-fill" style={{ width: `${product.sold}%` }} />
                    </div>
                    <div className="flash-progress-text">
                        <span>Đã bán {product.sold}%</span>
                        <span>Còn lại {remaining} sản phẩm</span>
                    </div>
                </div>
                <button className="flash-card-btn">Mua ngay</button>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION 5 — BEST SELLERS
   ═══════════════════════════════════════════════════════ */
function BestSellersSection() {
    const tabs = [
        { label: 'Tất cả', brandId: null },
        { label: 'Nike', brandId: 1 },
        { label: 'Adidas', brandId: 2 },
        { label: 'New Balance', brandId: 3 },
        { label: "Biti's Hunter", brandId: 4 },
        { label: 'Converse', brandId: 5 },
    ];

    const bestSellerIds = [4, 6, 8, 10, 15, 13, 1, 5]; // Nike Pegasus, Stan Smith, NB 574, Bitis Hunter X, Vans Old Skool, Converse, Air Max, Ultraboost
    const allProducts = bestSellerIds.map(id => PRODUCTS.find(p => p.product_id === id)).filter(Boolean);

    const [activeTab, setActiveTab] = useState(null);
    const [fading, setFading] = useState(false);
    const [wishlist, setWishlist] = useState([]);

    const filteredProducts = activeTab
        ? allProducts.filter(p => p.brand_id === activeTab)
        : allProducts;

    const handleTabChange = (brandId) => {
        setFading(true);
        setTimeout(() => {
            setActiveTab(brandId);
            setFading(false);
        }, 150);
    };

    const handleToggleWishlist = (id) => {
        setWishlist(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

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

                <div className="brand-filter-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.label}
                            className={`brand-tab ${activeTab === tab.brandId ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.brandId)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={`best-sellers-grid ${fading ? 'fading' : ''}`}>
                    {filteredProducts.map((product) => (
                        <CatalogProductCard
                            key={product.product_id}
                            product={product}
                            viewMode="grid"
                            onQuickView={() => { }}
                            onAddToCart={() => { }}
                            wishlist={wishlist}
                            onToggleWishlist={handleToggleWishlist}
                        />
                    ))}
                </div>

                <div className="best-sellers-more">
                    <Link to="/catalog" className="best-sellers-more-btn">
                        Xem tất cả sản phẩm →
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION 6 — BRAND BANNER
   ═══════════════════════════════════════════════════════ */
function BrandBanner() {
    const brands = ['NIKE', 'ADIDAS', 'NEW BALANCE', 'VANS', 'CONVERSE', "BITI'S"];
    const ref = useScrollReveal();
    return (
        <section className="brand-banner">
            <div className="section-container">
                <div className="brand-banner-layout scroll-reveal" ref={ref}>
                    <div>
                        <h2 className="brand-banner-title">
                            <span className="white">50+ THƯƠNG HIỆU</span><br />
                            <span className="light">CHÍNH HÃNG</span>
                        </h2>
                        <p className="brand-banner-sub">
                            Từ Nike, Adidas, đến Biti's Hunter — tất cả đều 100% authentic.
                        </p>
                    </div>
                    <div className="brand-logo-grid">
                        {brands.map((b, i) => (
                            <div key={i} className="brand-logo-card scroll-reveal-child" style={{ transitionDelay: `${i * 0.08}s` }}>
                                {b}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION 7 — TESTIMONIALS
   ═══════════════════════════════════════════════════════ */
const TESTIMONIALS = [
    { name: 'Nguyễn Văn Minh', initial: 'M', stars: 5, product: 'Nike Pegasus 40', text: 'Giày chất lượng tuyệt vời, đúng size, giao hàng nhanh. Mình đã mua lần thứ 3 rồi và lần nào cũng hài lòng. Highly recommend BestShoes!' },
    { name: 'Trần Thị Lan', initial: 'L', stars: 5, product: 'Adidas Stan Smith', text: 'Ban đầu mình hơi lo về size nhưng có hướng dẫn chọn size rất chi tiết. Đôi giày đẹp hơn ngoài mong đợi, da thật mềm và thoải mái.' },
    { name: 'Lê Hoàng Nam', initial: 'N', stars: 4, product: 'Vans Old Skool', text: 'Mua online mà được đổi trả free trong 7 ngày nên rất yên tâm. Sản phẩm đúng như mô tả, đóng gói cẩn thận. Sẽ tiếp tục ủng hộ shop!' },
    { name: 'Phạm Thu Hà', initial: 'H', stars: 5, product: 'Converse Chuck Taylor', text: 'Flash sale giảm 40% mà hàng vẫn xịn. Nhân viên tư vấn nhiệt tình, ship siêu nhanh chỉ 1 ngày. Tuyệt vời!' },
    { name: 'Hoàng Đức Anh', initial: 'A', stars: 5, product: 'Nike Air Max 270', text: 'Giày thể thao chạy bộ êm chân, đúng chất lượng Nike chính hãng. Giá ở đây tốt hơn nhiều so với cửa hàng.' },
    { name: 'Ngô Thị Bảo Châu', initial: 'C', stars: 4, product: "Biti's Hunter X", text: 'Giao diện web dễ dùng, thanh toán nhanh. Đôi dép da đẹp y hình, sẽ giới thiệu cho bạn bè cùng mua!' },
];

function TestimonialsSection() {
    const [current, setCurrent] = useState(0);
    const [isDesktop, setIsDesktop] = useState(true);
    const autoRef = useRef(null);

    const cardsPerView = isDesktop ? 3 : 1;
    const maxIndex = Math.ceil(TESTIMONIALS.length / cardsPerView) - 1;

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Auto slide
    useEffect(() => {
        autoRef.current = setInterval(() => {
            setCurrent(prev => (prev >= maxIndex ? 0 : prev + 1));
        }, 4000);
        return () => clearInterval(autoRef.current);
    }, [maxIndex]);

    const goTo = (idx) => {
        setCurrent(idx);
        clearInterval(autoRef.current);
        autoRef.current = setInterval(() => {
            setCurrent(prev => (prev >= maxIndex ? 0 : prev + 1));
        }, 4000);
    };

    const ref = useScrollReveal();

    const renderStars = (n) => {
        let s = '';
        for (let i = 0; i < 5; i++) s += i < n ? '★' : '☆';
        return s;
    };

    return (
        <section className="testimonials-section">
            <div className="section-container">
                <div className="section-header scroll-reveal" ref={ref}>
                    <div className="section-eyebrow">KHÁCH HÀNG NÓI GÌ</div>
                    <h2 className="section-title">
                        Hơn 10,000 khách hàng<br />
                        <span style={{ color: 'var(--hp-primary)' }}>hài lòng với BestShoes</span>
                    </h2>
                </div>

                <div className="testimonials-rating-summary">
                    <div className="testimonials-big-rating">4.9</div>
                    <div className="testimonials-stars-row">★★★★★</div>
                    <div className="testimonials-count">Dựa trên 10,842 đánh giá</div>
                </div>

                <div className="testimonial-carousel">
                    <div
                        className="testimonial-track"
                        style={{ transform: `translateX(-${current * (100 / (isDesktop ? 1 : 1))}%)` }}
                    >
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="testimonial-card scroll-reveal-child">
                                <div className="testimonial-stars">{renderStars(t.stars)}</div>
                                <div className="testimonial-quote-mark">"</div>
                                <p className="testimonial-text">{t.text}</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.initial}</div>
                                    <div>
                                        <div className="testimonial-author-name">{t.name}</div>
                                        <div className="testimonial-author-meta">
                                            Đã mua: {t.product} &nbsp;
                                            <span className="testimonial-verified">✓ Đã xác minh</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="testimonial-dots">
                    {Array.from({ length: maxIndex + 1 }, (_, i) => (
                        <button
                            key={i}
                            className={`testimonial-dot ${current === i ? 'active' : ''}`}
                            onClick={() => goTo(i)}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION 8 — FINAL CTA BANNER
   ═══════════════════════════════════════════════════════ */
function FinalCtaBanner() {
    const ref = useScrollReveal();
    return (
        <section className="final-cta">
            <div className="final-cta-glow" />
            <div className="final-cta-lines" />
            <div className="section-container">
                <div className="final-cta-content scroll-reveal" ref={ref}>
                    <h2 className="final-cta-title">
                        Sẵn sàng tìm đôi giày<br />hoàn hảo của bạn?
                    </h2>
                    <p className="final-cta-sub">
                        Khám phá hơn 10,000 sản phẩm từ 50+ thương hiệu hàng đầu thế giới.
                        Freeship — Đổi trả miễn phí — Chính hãng.
                    </p>
                    <div className="final-cta-buttons">
                        <Link to="/catalog" className="final-cta-btn-primary">Mua sắm ngay →</Link>
                        <Link to="/catalog" className="final-cta-btn-outline">Xem khuyến mãi</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   MAIN HOMEPAGE COMPONENT
   ═══════════════════════════════════════════════════════ */
function HomePage() {
    return (
        <div className="homepage">
            <HeroSection />
            <TrustBar />
            <FeaturedCategories />
            <FlashSaleSection />
            <BestSellersSection />
            <BrandBanner />
            <TestimonialsSection />
            <FinalCtaBanner />
        </div>
    );
}

export default HomePage;
