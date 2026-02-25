import React, { useRef, useState, useEffect } from 'react';
import CatalogProductCard from '../../Catalog2/components/CatalogProductCard';
import { UPSELL_PRODUCTS } from '../mockCartData';

const UpsellSection = () => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [wishlist, setWishlist] = useState([]);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            return () => el.removeEventListener('scroll', checkScroll);
        }
    }, []);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const scrollAmount = 260;
        el.scrollBy({ left: direction === 'next' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    };

    const handleToggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    return (
        <div className="cart-upsell-section">
            <div className="cart-container">
                <div className="cart-upsell-header">
                    <div>
                        <h2 className="cart-upsell-title">Có thể bạn cũng thích</h2>
                        <p className="cart-upsell-subtitle">Dựa trên sản phẩm trong giỏ hàng của bạn</p>
                    </div>
                    <a href="/catalog" className="cart-upsell-viewall">Xem tất cả →</a>
                </div>

                <div className="cart-upsell-scroll-wrapper">
                    <button
                        className={`cart-upsell-nav-btn prev ${!canScrollLeft ? 'hidden' : ''}`}
                        onClick={() => scroll('prev')}
                    >
                        ‹
                    </button>

                    <div className="cart-upsell-scroll" ref={scrollRef}>
                        {UPSELL_PRODUCTS.map(product => (
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

                    <button
                        className={`cart-upsell-nav-btn next ${!canScrollRight ? 'hidden' : ''}`}
                        onClick={() => scroll('next')}
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpsellSection;
