import React, { useState, useEffect } from 'react';
import SizeSelector from './SizeSelector';
import ColorSelector from './ColorSelector';
import './ProductDisplay.css';

const ProductDisplay = ({ productData }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Get available sizes and colors from variants
  const availableSizes = [...new Set(productData.variants.map(v => v.size?.sizeName).filter(Boolean))];
  const availableColors = [...new Set(productData.variants.map(v => v.color?.colorName).filter(Boolean))];

  // Get primary image for the product
  const getPrimaryImage = () => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      const primary = selectedVariant.images.find(img => img.isPrimary === true || img.isPrimary === 1);
      return primary ? primary.imageUrl : selectedVariant.images[0].imageUrl;
    }

    // Fallback to first variant's primary image
    const firstVariant = productData.variants[0];
    if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
      const primary = firstVariant.images.find(img => img.isPrimary === true || img.isPrimary === 1);
      return primary ? primary.imageUrl : firstVariant.images[0].imageUrl;
    }

    return null;
  };

  // Update selected variant when size or color changes
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = productData.variants.find(v =>
        v.size?.sizeName === selectedSize && v.color?.colorName === selectedColor
      );
      setSelectedVariant(variant || null);
    } else if (selectedSize) {
      const variant = productData.variants.find(v => v.size?.sizeName === selectedSize);
      setSelectedVariant(variant || null);
    } else if (selectedColor) {
      const variant = productData.variants.find(v => v.color?.colorName === selectedColor);
      setSelectedVariant(variant || null);
    } else {
      setSelectedVariant(productData.variants[0] || null);
    }
  }, [selectedSize, selectedColor, productData.variants]);

  // Initialize with first variant
  useEffect(() => {
    if (productData.variants && productData.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(productData.variants[0]);
    }
  }, [productData.variants, selectedVariant]);

  const primaryImage = getPrimaryImage();
  const currentPrice = selectedVariant ? Number(selectedVariant.price).toFixed(2) : '0.00';

  return (
    <div className="product-display">
      {/* Product Image */}
      <div className="product-image-section">
        <div className="product-image">
          {primaryImage ? (
            <img src={primaryImage} alt={productData.product.name} />
          ) : (
            <div className="image-placeholder"></div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="product-details-section">
        {/* Product Title */}
        <h1 className="product-title">
          {productData.product.name}
        </h1>

        {/* Purchase Heading */}
        <div className="purchase-heading">
          <h2 className="purchase-title">Purchase</h2>
        </div>

        {/* Purchase Details */}
        <div className="purchase-details">
          {/* Price */}
          <div className="detail-item">
            <h3 className="detail-label">Price</h3>
            <p className="price-value">${currentPrice}</p>
          </div>

          {/* Size */}
          <div className="detail-item">
            <h3 className="detail-label">Size</h3>
            <SizeSelector
              sizes={availableSizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />
          </div>

          {/* Color */}
          <div className="detail-item">
            <h3 className="detail-label">Color</h3>
            <ColorSelector
              colors={availableColors}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </div>

          {/* Buy Button */}
          <div className="buy-section">
            <button className="buy-button">
              <span className="buy-text">Buy</span>
            </button>
            <button className="favorite-button">
              <span className="favorite-icon">♥</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
