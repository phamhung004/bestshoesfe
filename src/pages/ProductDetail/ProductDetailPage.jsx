import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail } from '../../hooks/useProductDetail';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatVND } from '../../utils/formatPrice';
import ProductDetailSkeleton from '../../components/common/ProductDetailSkeleton';
import ErrorState from '../../components/common/ErrorState';
import CatalogProductCard from '../Catalog2/components/CatalogProductCard';
import ProductReviewsSection from './components/ProductReviewsSection';
import './ProductDetailPage.css';


const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const { wishlistArray, toggleWishlist, isWished } = useWishlist();
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [cartError, setCartError] = useState('');

    const {
        product,
        relatedProducts,
        loading,
        error,
        selectedColor,
        selectedSize,
        selectedVariant,
        setSelectedColor,
        setSelectedSize,
        availableSizesForColor,
        allSizes,
        availableColors,
        stockCount,
        isInStock,
    } = useProductDetail(Number(productId));

    useEffect(() => {
        if (product) {
            document.title = `${product.name} | BestShoes`;
        }
        return () => { document.title = 'BestShoes'; };
    }, [product]);

    // Reset quantity and error when variant changes
    useEffect(() => {
        setQuantity(1);
        setCartError('');
    }, [selectedVariant?.variantId]);

    // How many of this variant the user already has in the cart
    const cartQty = useMemo(() => {
        if (!selectedVariant) return 0;
        const found = cartItems.find(item => item.variant?.variant_id === selectedVariant.variantId);
        return found ? found.quantity : 0;
    }, [cartItems, selectedVariant]);

    // Maximum additional quantity the user can add
    const maxCanAdd = Math.max(0, stockCount - cartQty);

    if (loading) return <ProductDetailSkeleton />;

    if (error) {
        return (
            <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                <ErrorState
                    title="Không tìm thấy sản phẩm"
                    message={error}
                />
                <button
                    onClick={() => navigate('/catalog')}
                    style={{
                        marginTop: 16, padding: '10px 24px', border: '1px solid #4f46e5',
                        borderRadius: 8, background: 'transparent', color: '#4f46e5',
                        cursor: 'pointer', fontSize: 14,
                    }}
                >
                    ← Quay lại cửa hàng
                </button>
            </div>
        );
    }

    if (!product) return null;

    // Gallery images — from selected variant or first variant
    const galleryImages = (selectedVariant?.images ?? [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const primaryImage = galleryImages.find(i => i.isPrimary) ?? galleryImages[0];

    // Stock indicator
    const stockIndicator = isInStock
        ? stockCount <= 5
            ? { text: `⚠ Chỉ còn ${stockCount} sản phẩm`, color: '#d97706', showCount: false }
            : { text: `✓ Còn hàng`, color: '#16a34a', showCount: true }
        : { text: '✗ Hết hàng', color: '#dc2626', showCount: false };

    // Price info
    const basePrice = selectedVariant?.price ?? 0;
    const promoPrice = selectedVariant?.promotionalPrice;
    const discPct = selectedVariant?.discountPercentage;
    const hasPromo = promoPrice != null && promoPrice < basePrice;

    return (
        <div className="pdp-page">
            {/* Breadcrumb */}
            <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
                <a href="/">Trang chủ</a>
                <span className="pdp-sep">/</span>
                <a href="/catalog">Sản phẩm</a>
                {product.categoryName && (
                    <>
                        <span className="pdp-sep">/</span>
                        <span className="pdp-breadcrumb-dimmed">{product.categoryName}</span>
                    </>
                )}
                <span className="pdp-sep">/</span>
                <span className="pdp-breadcrumb-current">{product.name}</span>
            </nav>

            {/* Main layout */}
            <div className="pdp-layout">
                {/* ── Left: Gallery ─────────────────────── */}
                <div className="pdp-gallery">
                    <div className="pdp-main-image">
                        {primaryImage ? (
                            <img src={primaryImage.imageUrl} alt={primaryImage.altText ?? product.name} />
                        ) : (
                            <div className="pdp-image-placeholder">👟</div>
                        )}
                        {hasPromo && discPct && (
                            <div className="pdp-promo-badge">−{Math.round(discPct)}%</div>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {galleryImages.length > 1 && (
                        <div className="pdp-thumbnails">
                            {galleryImages.map((img, i) => (
                                <img
                                    key={img.imageId ?? i}
                                    src={img.imageUrl}
                                    alt={img.altText ?? `${product.name} ${i + 1}`}
                                    className={`pdp-thumb ${img === primaryImage ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right: Product info ────────────────── */}
                <div className="pdp-info">
                    {product.brandName && (
                        <div className="pdp-brand">{product.brandName}</div>
                    )}
                    <h1 className="pdp-name">{product.name}</h1>

                    {/* Price */}
                    <div className="pdp-price">
                        {hasPromo ? (
                            <>
                                <span className="pdp-price-promo">{formatVND(promoPrice)}</span>
                                <span className="pdp-price-original">{formatVND(basePrice)}</span>
                                <span className="pdp-price-badge">−{Math.round(discPct)}%</span>
                            </>
                        ) : (
                            <span className="pdp-price-regular">{formatVND(basePrice)}</span>
                        )}
                    </div>

                    {/* Color selector */}
                    {availableColors.length > 0 && (
                        <div className="pdp-section">
                            <div className="pdp-label">
                                Màu sắc: <strong>{selectedColor?.colorName ?? ''}</strong>
                            </div>
                            <div className="pdp-colors">
                                {availableColors.map(c => (
                                    <button
                                        key={c.colorId}
                                        className={`pdp-color-btn ${selectedColor?.colorId === c.colorId ? 'active' : ''}`}
                                        style={{ backgroundColor: c.colorCode || '#999' }}
                                        onClick={() => setSelectedColor({ colorId: c.colorId, colorName: c.colorName, colorCode: c.colorCode })}
                                        title={c.colorName}
                                        aria-label={c.colorName}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size selector */}
                    {allSizes.length > 0 && (
                        <div className="pdp-section">
                            <div className="pdp-label">
                                Size: <strong>{selectedSize ?? 'Chưa chọn'}</strong>
                            </div>
                            <div className="pdp-sizes">
                                {allSizes.map(size => {
                                    const available = availableSizesForColor.includes(size);
                                    return (
                                        <button
                                            key={size}
                                            className={`pdp-size-btn
                                                ${selectedSize === size ? 'active' : ''}
                                                ${!available ? 'unavailable' : ''}
                                            `}
                                            onClick={() => available && setSelectedSize(size)}
                                            disabled={!available}
                                            title={!available ? 'Hết hàng màu này' : `Size ${size}`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stock indicator */}
                    <div className="pdp-stock-wrapper">
                        <div className="pdp-stock" style={{ color: stockIndicator.color }}>
                            {stockIndicator.text}
                        </div>
                        {selectedVariant && isInStock && stockIndicator.showCount && (
                            <div className="pdp-stock-count-badge">
                                {stockCount} sản phẩm có sẵn
                            </div>
                        )}
                    </div>

                    {/* Quantity selector */}
                    {selectedVariant && isInStock && (
                        <div className="pdp-qty-row">
                            <span className="pdp-qty-label">Số lượng</span>
                            <div className="pdp-qty-stepper">
                                <button
                                    className="pdp-qty-btn"
                                    onClick={() => { setQuantity(q => Math.max(1, q - 1)); setCartError(''); }}
                                    disabled={quantity <= 1}
                                    aria-label="Giảm số lượng"
                                >−</button>
                                <input
                                    className="pdp-qty-value"
                                    type="number"
                                    min={1}
                                    max={maxCanAdd || stockCount}
                                    value={quantity}
                                    onChange={e => {
                                        const val = parseInt(e.target.value, 10);
                                        if (!isNaN(val)) {
                                            const clamped = Math.min(maxCanAdd || stockCount, Math.max(1, val));
                                            setQuantity(clamped);
                                            if (val > (maxCanAdd || stockCount)) {
                                                setCartError(cartQty > 0
                                                    ? `Bạn đã có ${cartQty} sản phẩm trong giỏ. Chỉ còn ${maxCanAdd} sản phẩm có thể thêm.`
                                                    : `Số lượng tối đa là ${stockCount}.`);
                                            } else {
                                                setCartError('');
                                            }
                                        }
                                    }}
                                    onBlur={e => {
                                        const val = parseInt(e.target.value, 10);
                                        const max = maxCanAdd || stockCount;
                                        setQuantity(isNaN(val) || val < 1 ? 1 : Math.min(max, val));
                                    }}
                                    aria-label="Số lượng"
                                />
                                <button
                                    className="pdp-qty-btn"
                                    onClick={() => {
                                        const max = maxCanAdd || stockCount;
                                        if (quantity >= max) {
                                            setCartError(cartQty > 0
                                                ? `Bạn đã có ${cartQty} sản phẩm trong giỏ. Chỉ còn ${maxCanAdd} sản phẩm có thể thêm.`
                                                : `Số lượng tối đa là ${stockCount}.`);
                                            return;
                                        }
                                        setQuantity(q => Math.min(max, q + 1));
                                        setCartError('');
                                    }}
                                    disabled={quantity >= (maxCanAdd || stockCount)}
                                    aria-label="Tăng số lượng"
                                >+</button>
                            </div>
                            <span className="pdp-qty-max-hint">/ {stockCount}</span>
                            {cartQty > 0 && (
                                <span className="pdp-qty-incart-hint">(đã có {cartQty} trong giỏ)</span>
                            )}
                        </div>
                    )}

                    {/* CTA Buttons */}
                    {cartError && (
                        <div className="pdp-cart-error">
                            ⚠ {cartError}
                        </div>
                    )}
                    <div className="pdp-cta-row">
                    <button
                        className={`pdp-add-btn ${(!selectedVariant || !isInStock || addingToCart || maxCanAdd === 0) ? 'disabled' : ''}`}
                        disabled={!selectedVariant || !isInStock || addingToCart || maxCanAdd === 0}
                        onClick={async () => {
                            if (!selectedVariant || !isInStock || addingToCart) return;
                            // Final stock guard
                            if (quantity < 1) {
                                setCartError('Số lượng phải ít nhất là 1.');
                                return;
                            }
                            if (quantity > maxCanAdd) {
                                const msg = cartQty > 0
                                    ? `Bạn đã có ${cartQty} sản phẩm trong giỏ. Chỉ còn ${maxCanAdd} sản phẩm có thể thêm.`
                                    : `Số lượng vượt quá tồn kho (tối đa ${stockCount}).`;
                                setCartError(msg);
                                setQuantity(Math.max(1, maxCanAdd));
                                return;
                            }
                            setCartError('');
                            setAddingToCart(true);
                            const ok = await addToCart(selectedVariant.variantId, quantity);
                            setAddingToCart(false);
                            if (ok) setQuantity(1);
                        }}
                    >
                        {addingToCart
                            ? 'Đang thêm...'
                            : !selectedVariant
                                ? 'Vui lòng chọn màu & size'
                                : !isInStock || maxCanAdd === 0
                                    ? 'Hết hàng'
                                    : 'Thêm vào giỏ hàng'}
                    </button>

                    <button
                        className={`pdp-wishlist-btn${isWished(product?.productId) ? ' active' : ''}`}
                        onClick={() => toggleWishlist(product?.productId)}
                        aria-label={isWished(product?.productId) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                        title={isWished(product?.productId) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                    >
                        {isWished(product?.productId) ? '❤' : '♡'}
                    </button>
                    </div>

                    {/* Highlights */}
                    {product.highlights?.length > 0 && (
                        <ul className="pdp-highlights">
                            {product.highlights.map((h, i) => (
                                <li key={i}>✓ {h}</li>
                            ))}
                        </ul>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div className="pdp-section">
                            <h3 className="pdp-section-title">Mô tả sản phẩm</h3>
                            <p className="pdp-description">{product.description}</p>
                        </div>
                    )}

                    {/* Meta tags */}
                    <div className="pdp-meta">
                        {(product.code || product.productCode) && (
                            <span>Mã sản phẩm: <strong>{product.code || product.productCode}</strong></span>
                        )}
                        {(selectedVariant?.sku || selectedVariant?.variantSku) && (
                            <span>SKU biến thể: <strong>{selectedVariant?.sku || selectedVariant?.variantSku}</strong></span>
                        )}
                        {product.categoryName && (
                            <span>Danh mục: <strong>{product.categoryName}</strong></span>
                        )}
                        {product.materialName && (
                            <span>Chất liệu: <strong>{product.materialName}</strong></span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Product Reviews ───────────────────────────── */}
            <ProductReviewsSection productId={Number(productId)} />

            {/* ── Related products ──────────────────────────── */}
            {relatedProducts.length > 0 && (
                <section className="pdp-related">
                    <h2 className="pdp-related-title">Sản phẩm liên quan</h2>
                    <div className="pdp-related-grid">
                        {relatedProducts.map(rp => (
                            <CatalogProductCard
                                key={rp.productId}
                                product={rp}
                                viewMode="grid-4"
                                wishlist={wishlistArray}
                                onToggleWishlist={toggleWishlist}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetailPage;
