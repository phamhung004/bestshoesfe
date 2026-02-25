import React, { useState, useEffect, useCallback } from 'react';
import {
    formatVND,
    getActivePromotion,
    getDiscountedPrice,
    getProductColors,
    getProductSizes,
    BRANDS,
    COLORS,
    SIZES,
} from '../mockCatalogData';

const QuickViewModal = ({ product, onClose, onAddToCart, wishlist, onToggleWishlist }) => {
    const [selectedColorId, setSelectedColorId] = useState(null);
    const [selectedSizeId, setSelectedSizeId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');

    const brand = BRANDS.find(b => b.brand_id === product.brand_id);
    const colors = getProductColors(product);
    const sizes = getProductSizes(product);
    const promotion = getActivePromotion(product);
    const isWished = wishlist.includes(product.product_id);

    // Get all images for this product
    const allImages = product.images || [];

    // Initialize main image
    useEffect(() => {
        const primary = allImages.find(i => i.is_primary);
        setMainImage(primary ? primary.image_url : allImages[0]?.image_url || '');
    }, [product]);

    // When color changes, update main image
    useEffect(() => {
        if (selectedColorId) {
            const variant = product.variants.find(v => v.color_id === selectedColorId && v.status === 1);
            if (variant) {
                const img = allImages.find(i => i.variant_id === variant.variant_id);
                if (img) setMainImage(img.image_url);
            }
        }
    }, [selectedColorId]);

    // Get current variant based on selections
    const getCurrentVariant = () => {
        if (!selectedColorId || !selectedSizeId) return null;
        return product.variants.find(v =>
            v.color_id === selectedColorId &&
            v.size_id === selectedSizeId &&
            v.status === 1
        );
    };

    const currentVariant = getCurrentVariant();
    const currentPrice = currentVariant ? currentVariant.price : Math.min(...product.variants.filter(v => v.status === 1).map(v => v.price));
    const discountedPrice = getDiscountedPrice(currentPrice, promotion);
    const stock = currentVariant ? currentVariant.stock : 0;

    // Check if a specific size is available for the selected color
    const isSizeAvailable = (sizeId) => {
        if (!selectedColorId) {
            return product.variants.some(v => v.size_id === sizeId && v.status === 1 && v.stock > 0);
        }
        return product.variants.some(v =>
            v.size_id === sizeId && v.color_id === selectedColorId && v.status === 1 && v.stock > 0
        );
    };

    // Keyboard handler: Escape to close
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    // Render stars
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`catalog-star ${i < Math.floor(rating) ? 'filled' : i < rating ? 'half' : 'empty'}`}>
                {i < rating ? '★' : '☆'}
            </span>
        ));
    };

    const handleAddToCart = () => {
        if (!currentVariant) return;
        onAddToCart(product, currentVariant, quantity);
        onClose();
    };

    const selectedColorName = selectedColorId
        ? COLORS.find(c => c.color_id === selectedColorId)?.color_name
        : '';

    return (
        <div className="catalog-modal-overlay" onClick={onClose}>
            <div className="catalog-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Xem nhanh sản phẩm">
                <button className="catalog-modal-close" onClick={onClose} aria-label="Đóng">×</button>

                {/* Left: Image gallery */}
                <div className="catalog-modal-gallery">
                    <div className="catalog-modal-main-img-wrap">
                        <img className="catalog-modal-main-img" src={mainImage} alt={product.name} />
                    </div>
                    <div className="catalog-modal-thumbs">
                        {allImages.map((img, idx) => (
                            <div
                                key={idx}
                                className={`catalog-modal-thumb ${mainImage === img.image_url ? 'active' : ''}`}
                                onClick={() => setMainImage(img.image_url)}
                            >
                                <img src={img.image_url} alt={`${product.name} ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="catalog-modal-details">
                    {brand && <div className="catalog-modal-brand">{brand.name}</div>}
                    <h2 className="catalog-modal-name">{product.name}</h2>

                    {/* Rating */}
                    <div className="catalog-modal-rating">
                        <div className="catalog-stars">{renderStars(product.rating)}</div>
                        <span className="catalog-modal-rating-link">({product.review_count} đánh giá)</span>
                    </div>

                    {/* Price */}
                    <div className="catalog-modal-price">
                        {discountedPrice ? (
                            <>
                                <span className="catalog-price-current">{formatVND(discountedPrice)}</span>
                                <span className="catalog-price-original">{formatVND(currentPrice)}</span>
                                {promotion.discount_percentage && (
                                    <span className="catalog-price-discount-badge">−{promotion.discount_percentage}%</span>
                                )}
                            </>
                        ) : (
                            <span className="catalog-price-current">{formatVND(currentPrice)}</span>
                        )}
                    </div>

                    {/* Color selector */}
                    {colors.length > 0 && (
                        <div>
                            <div className="catalog-modal-selector-label">
                                Màu sắc: <strong>{selectedColorName || 'Chọn màu'}</strong>
                            </div>
                            <div className="catalog-modal-color-dots">
                                {colors.map(c => {
                                    const isLight = (() => {
                                        const r = parseInt(c.color_code.slice(1, 3), 16);
                                        const g = parseInt(c.color_code.slice(3, 5), 16);
                                        const b = parseInt(c.color_code.slice(5, 7), 16);
                                        return (r * 299 + g * 587 + b * 114) / 1000 > 200;
                                    })();

                                    return (
                                        <button
                                            key={c.color_id}
                                            className={`catalog-modal-color-dot ${selectedColorId === c.color_id ? 'selected' : ''}`}
                                            style={{ backgroundColor: c.color_code }}
                                            onClick={() => setSelectedColorId(c.color_id)}
                                            title={c.color_name}
                                            aria-label={c.color_name}
                                        >
                                            {selectedColorId === c.color_id && (
                                                <span style={{ color: isLight ? '#333' : '#fff', fontSize: '14px', fontWeight: 700 }}>✓</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Size selector */}
                    <div>
                        <div className="catalog-modal-selector-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Size:</span>
                            <span className="catalog-modal-size-guide">Hướng dẫn chọn size</span>
                        </div>
                        <div className="catalog-modal-sizes">
                            {SIZES.map(size => {
                                const available = isSizeAvailable(size.size_id);
                                const isSelected = selectedSizeId === size.size_id;

                                return (
                                    <button
                                        key={size.size_id}
                                        className={`catalog-modal-size-chip ${isSelected ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                                        onClick={() => available && setSelectedSizeId(size.size_id)}
                                        disabled={!available}
                                    >
                                        {size.size_name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity stepper */}
                    <div>
                        <div className="catalog-modal-selector-label">Số lượng:</div>
                        <div className="catalog-qty-stepper">
                            <button
                                className="catalog-qty-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                −
                            </button>
                            <div className="catalog-qty-value">{quantity}</div>
                            <button
                                className="catalog-qty-btn"
                                onClick={() => setQuantity(q => Math.min(stock || 99, q + 1))}
                                disabled={quantity >= (stock || 99)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Stock indicator */}
                    {currentVariant && (
                        <div className={`catalog-stock-indicator ${stock > 5 ? 'high' : stock > 0 ? 'low' : 'out'}`}>
                            {stock > 0 ? `Còn ${stock} sản phẩm` : 'Hết hàng'}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="catalog-modal-actions">
                        <button
                            className={`catalog-add-btn primary ${(!selectedSizeId || !selectedColorId) ? 'disabled' : ''}`}
                            onClick={handleAddToCart}
                            disabled={!selectedSizeId || !selectedColorId || stock === 0}
                        >
                            Thêm vào giỏ
                        </button>
                        <button
                            className={`catalog-add-btn secondary ${(!selectedSizeId || !selectedColorId) ? 'disabled' : ''}`}
                            disabled={!selectedSizeId || !selectedColorId || stock === 0}
                        >
                            Mua ngay
                        </button>
                        <button
                            className={`catalog-modal-wishlist ${isWished ? 'active' : ''}`}
                            onClick={() => onToggleWishlist(product.product_id)}
                            aria-label="Yêu thích"
                        >
                            <span style={{ fontSize: 18, color: isWished ? '#EF4444' : '#9CA3AF' }}>
                                {isWished ? '❤' : '♡'}
                            </span>
                        </button>
                    </div>

                    {/* Product highlights */}
                    <div className="catalog-modal-highlights">
                        <div className="catalog-modal-highlight">
                            <span className="catalog-modal-highlight-icon">🚚</span>
                            Miễn phí giao hàng đơn từ 500.000 ₫
                        </div>
                        <div className="catalog-modal-highlight">
                            <span className="catalog-modal-highlight-icon">🔄</span>
                            Đổi trả miễn phí trong 7 ngày
                        </div>
                        <div className="catalog-modal-highlight">
                            <span className="catalog-modal-highlight-icon">✅</span>
                            Sản phẩm chính hãng 100%
                        </div>
                        <div className="catalog-modal-highlight">
                            <span className="catalog-modal-highlight-icon">🛡</span>
                            Bảo hành 12 tháng
                        </div>
                    </div>

                    {/* Full page link */}
                    <a href="#" className="catalog-modal-fullpage-link">
                        Xem trang sản phẩm đầy đủ →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
