import React, { useState } from 'react';
import {
    formatVND,
    getMinPrice,
    getPrimaryImage,
    getSecondaryImage,
    getProductColors,
    getProductSizes,
    getActivePromotion,
    getDiscountedPrice,
    isNewProduct,
    getTotalStock,
    BRANDS,
} from '../mockCatalogData';

const CatalogProductCard = ({ product, viewMode, onQuickView, onAddToCart, wishlist, onToggleWishlist }) => {
    const [activeColorId, setActiveColorId] = useState(null);
    const isWished = wishlist.includes(product.product_id);

    const brand = BRANDS.find(b => b.brand_id === product.brand_id);
    const minPrice = getMinPrice(product);
    const promotion = getActivePromotion(product);
    const discountedPrice = getDiscountedPrice(minPrice, promotion);
    const isNew = isNewProduct(product);
    const totalStock = getTotalStock(product);
    const colors = getProductColors(product);
    const sizes = getProductSizes(product);
    const isList = viewMode === 'list';

    const primaryImg = getPrimaryImage(product, activeColorId);
    const secondaryImg = getSecondaryImage(product);

    // Render star rating
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => {
            if (i < Math.floor(rating)) return <span key={i} className="catalog-star filled">★</span>;
            if (i < rating) return <span key={i} className="catalog-star half">★</span>;
            return <span key={i} className="catalog-star empty">☆</span>;
        });
    };

    // Badges logic: max 2
    const badges = [];
    if (isNew) badges.push({ type: 'new', label: 'MỚI' });
    if (promotion && promotion.discount_percentage) {
        badges.push({ type: 'discount', label: `−${promotion.discount_percentage}%` });
    }
    if (product.isBestseller && badges.length < 2) {
        badges.push({ type: 'hot', label: 'HOT' });
    }

    const hasMultipleVariants = product.variants.filter(v => v.status === 1).length > 1;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (totalStock === 0) return;
        if (hasMultipleVariants) {
            onQuickView(product);
        } else {
            onAddToCart(product, product.variants[0]);
        }
    };

    return (
        <div className={`catalog-card ${isList ? 'list-mode' : ''}`}>
            {/* Image area */}
            <div className="catalog-card-image-wrap">
                <img
                    className="catalog-card-img primary"
                    src={primaryImg}
                    alt={product.name}
                    loading="lazy"
                />
                {secondaryImg && (
                    <img
                        className="catalog-card-img secondary"
                        src={secondaryImg}
                        alt={`${product.name} - góc khác`}
                        loading="lazy"
                    />
                )}

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="catalog-card-badges">
                        {badges.slice(0, 2).map((b, i) => (
                            <span key={i} className={`catalog-badge ${b.type}`}>{b.label}</span>
                        ))}
                    </div>
                )}

                {/* Wishlist heart */}
                <button
                    className={`catalog-wishlist-btn ${isWished ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.product_id); }}
                    aria-label={isWished ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                    <span className="heart-icon">{isWished ? '❤' : '♡'}</span>
                </button>

                {/* Quick view button */}
                <button
                    className="catalog-quickview-btn"
                    onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
                    aria-label="Xem nhanh"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    Xem nhanh
                </button>
            </div>

            {/* Card body */}
            <div className="catalog-card-body">
                {brand && <div className="catalog-card-brand">{brand.name}</div>}

                <h3 className="catalog-card-name">{product.name}</h3>

                {/* Star rating */}
                <div className="catalog-card-rating">
                    <div className="catalog-stars">{renderStars(product.rating)}</div>
                    <span className="catalog-card-rating-count">({product.review_count} đánh giá)</span>
                </div>

                {/* Price */}
                <div className="catalog-card-price">
                    {discountedPrice ? (
                        <>
                            <span className="catalog-price-current">{formatVND(discountedPrice)}</span>
                            <span className="catalog-price-original">{formatVND(minPrice)}</span>
                            {promotion.discount_percentage && (
                                <span className="catalog-price-discount-badge">−{promotion.discount_percentage}%</span>
                            )}
                        </>
                    ) : (
                        <span className="catalog-price-current">{formatVND(minPrice)}</span>
                    )}
                </div>

                {/* Color dots */}
                {colors.length > 0 && (
                    <div className="catalog-card-colors">
                        {colors.slice(0, 4).map(c => (
                            <button
                                key={c.color_id}
                                className={`catalog-card-color-dot ${activeColorId === c.color_id ? 'active' : ''}`}
                                style={{ backgroundColor: c.color_code }}
                                onClick={(e) => { e.stopPropagation(); setActiveColorId(c.color_id); }}
                                title={c.color_name}
                                aria-label={c.color_name}
                            />
                        ))}
                        {colors.length > 4 && (
                            <span className="catalog-card-color-more">+{colors.length - 4}</span>
                        )}
                    </div>
                )}

                {/* Size availability */}
                <div className="catalog-card-sizes">
                    <span style={{ fontWeight: 500 }}>Size: </span>
                    {sizes.map(s => (
                        <span key={s.size_id} className={!s.inStock ? 'out-of-stock' : ''}>
                            {s.size_name}
                        </span>
                    ))}
                </div>

                {/* Add to cart button */}
                {totalStock > 0 ? (
                    <button className="catalog-add-btn primary" onClick={handleAddToCart}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                        </svg>
                        Thêm vào giỏ
                    </button>
                ) : (
                    <button className="catalog-add-btn disabled" disabled>
                        Hết hàng
                    </button>
                )}

                {/* List mode extras */}
                {isList && (
                    <>
                        <p className="catalog-card-desc-excerpt">{product.description}</p>
                        <div className="catalog-card-footer">
                            <button className="catalog-add-btn secondary" onClick={(e) => { e.stopPropagation(); }}>
                                Xem chi tiết
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CatalogProductCard;
