import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail } from '../../hooks/useProductDetail';
import { formatVND } from '../../utils/formatPrice';
import ProductDetailSkeleton from '../../components/common/ProductDetailSkeleton';
import ErrorState from '../../components/common/ErrorState';
import CatalogProductCard from '../Catalog2/components/CatalogProductCard';
import './ProductDetailPage.css';


const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

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
            ? { text: `⚠ Chỉ còn ${stockCount} sản phẩm`, color: '#d97706' }
            : { text: '✓ Còn hàng', color: '#16a34a' }
        : { text: '✗ Hết hàng', color: '#dc2626' };

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
                    <div className="pdp-stock" style={{ color: stockIndicator.color }}>
                        {stockIndicator.text}
                    </div>

                    {/* CTA */}
                    <button
                        className={`pdp-add-btn ${(!selectedVariant || !isInStock) ? 'disabled' : ''}`}
                        disabled={!selectedVariant || !isInStock}
                        onClick={() => {
                            // TODO: integrate with cart context
                            alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
                        }}
                    >
                        {!selectedVariant
                            ? 'Vui lòng chọn màu & size'
                            : !isInStock
                                ? 'Hết hàng'
                                : 'Thêm vào giỏ hàng'}
                    </button>

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
                        {product.categoryName && (
                            <span>Danh mục: <strong>{product.categoryName}</strong></span>
                        )}
                        {product.materialName && (
                            <span>Chất liệu: <strong>{product.materialName}</strong></span>
                        )}
                    </div>
                </div>
            </div>

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
                                wishlist={[]}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetailPage;
