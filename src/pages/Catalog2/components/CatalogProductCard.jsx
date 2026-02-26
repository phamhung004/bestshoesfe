import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatVND } from '../../../utils/formatPrice';

/**
 * CatalogProductCard — uses ProductSummaryDTO from real API.
 *
 * Expected product fields:
 *   productId, name, brandName, categoryName,
 *   minPrice, maxPrice, primaryImageUrl,
 *   discountPercentage, promotionalPrice, isNew,
 *   availableSizes (string[]), availableColors ({colorId, colorName, colorCode}[]),
 *   averageRating, reviewCount
 */
const CatalogProductCard = ({ product, viewMode, onQuickView, onAddToCart, wishlist = [], onToggleWishlist }) => {
    const navigate = useNavigate();
    const [activeColorCode, setActiveColorCode] = useState(null);

    const {
        productId,
        name = '',
        brandName,
        minPrice = 0,
        promotionalPrice,
        discountPercentage,
        primaryImageUrl,
        isNew: isNewProduct,
        availableSizes = [],
        availableColors = [],
        averageRating = 0,
        reviewCount = 0,
    } = product;

    const isWished = wishlist.includes(productId);
    const isList = viewMode === 'list';
    const hasPromotion = promotionalPrice != null && promotionalPrice < minPrice;
    const displayPrice = hasPromotion ? promotionalPrice : minPrice;

    // Render star rating
    const renderStars = (rating) =>
        Array.from({ length: 5 }, (_, i) => {
            if (i < Math.floor(rating)) return <span key={i} className="catalog-star filled">★</span>;
            if (i < rating) return <span key={i} className="catalog-star half">★</span>;
            return <span key={i} className="catalog-star empty">☆</span>;
        });

    // Badges — max 2
    const badges = [];
    if (isNewProduct) badges.push({ type: 'new', label: 'MỚI' });
    if (hasPromotion && discountPercentage) {
        badges.push({ type: 'discount', label: `−${Math.round(discountPercentage)}%` });
    }

    const handleCardClick = () => navigate(`/products/${productId}`);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (onAddToCart) onAddToCart(product);
    };

    return (
        <div className={`catalog-card ${isList ? 'list-mode' : ''}`} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            {/* Image area */}
            <div className="catalog-card-image-wrap">
                {primaryImageUrl ? (
                    <img
                        className="catalog-card-img primary"
                        src={primaryImageUrl}
                        alt={name}
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="catalog-card-img primary"
                        style={{ background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}
                    >
                        👟
                    </div>
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
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(productId); }}
                    aria-label={isWished ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                    <span className="heart-icon">{isWished ? '❤' : '♡'}</span>
                </button>

                {/* Quick view button */}
                <button
                    className="catalog-quickview-btn"
                    onClick={(e) => { e.stopPropagation(); onQuickView?.(product); }}
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
                {brandName && <div className="catalog-card-brand">{brandName}</div>}

                <h3 className="catalog-card-name">{name}</h3>

                {/* Star rating */}
                <div className="catalog-card-rating">
                    <div className="catalog-stars">{renderStars(averageRating)}</div>
                    <span className="catalog-card-rating-count">({reviewCount} đánh giá)</span>
                </div>

                {/* Price */}
                <div className="catalog-card-price">
                    {hasPromotion ? (
                        <>
                            <span className="catalog-price-current">{formatVND(displayPrice)}</span>
                            <span className="catalog-price-original">{formatVND(minPrice)}</span>
                            {discountPercentage && (
                                <span className="catalog-price-discount-badge">−{Math.round(discountPercentage)}%</span>
                            )}
                        </>
                    ) : (
                        <span className="catalog-price-current">{formatVND(minPrice)}</span>
                    )}
                </div>

                {/* Color dots */}
                {availableColors.length > 0 && (
                    <div className="catalog-card-colors">
                        {availableColors.slice(0, 4).map((c) => (
                            <button
                                key={c.colorId}
                                className={`catalog-card-color-dot ${activeColorCode === c.colorCode ? 'active' : ''}`}
                                style={{ backgroundColor: c.colorCode || '#999' }}
                                onClick={(e) => { e.stopPropagation(); setActiveColorCode(c.colorCode); }}
                                title={c.colorName}
                                aria-label={c.colorName}
                            />
                        ))}
                        {availableColors.length > 4 && (
                            <span className="catalog-card-color-more">+{availableColors.length - 4}</span>
                        )}
                    </div>
                )}

                {/* Size availability */}
                {availableSizes.length > 0 && (
                    <div className="catalog-card-sizes">
                        <span style={{ fontWeight: 500 }}>Size: </span>
                        {availableSizes.slice(0, 6).map((s) => (
                            <span key={s}>{s}</span>
                        ))}
                        {availableSizes.length > 6 && <span>...</span>}
                    </div>
                )}

                {/* Add to cart button */}
                <button className="catalog-add-btn primary" onClick={handleAddToCart}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                    </svg>
                    Thêm vào giỏ
                </button>

                {/* List mode extras */}
                {isList && (
                    <div className="catalog-card-footer">
                        <button className="catalog-add-btn secondary" onClick={(e) => { e.stopPropagation(); navigate(`/products/${productId}`); }}>
                            Xem chi tiết
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogProductCard;
