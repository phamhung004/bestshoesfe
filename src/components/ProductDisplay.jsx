import React from 'react';
import SizeSelector from './SizeSelector';
import ColorSelector from './ColorSelector';
import './ProductDisplay.css';

const ProductDisplay = () => {
  return (
    <div className="product-display">
      {/* Product Image */}
      <div className="product-image-section">
        <div className="product-image">
          <div className="image-placeholder"></div>
        </div>
      </div>

      {/* Product Details */}
      <div className="product-details-section">
        {/* Product Title */}
        <h1 className="product-title">
          WELL SHOES SNEAKERS WHITE - 001
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
            <p className="price-value">$100</p>
          </div>

          {/* Size */}
          <div className="detail-item">
            <h3 className="detail-label">Size</h3>
            <SizeSelector />
          </div>

          {/* Color */}
          <div className="detail-item">
            <h3 className="detail-label">Color</h3>
            <ColorSelector />
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
