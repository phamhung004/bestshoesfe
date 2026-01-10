import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image">
        {/* Placeholder for product image */}
        <div className="image-placeholder"></div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">${product.price}</p>

        {/* Action Buttons */}
        <div className="product-actions">
          <button className="purchase-button">
            <span className="purchase-text">Purchase</span>
          </button>
          <button className="favorite-button">
            <span className="favorite-icon">♥</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
