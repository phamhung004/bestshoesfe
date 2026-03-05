import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handlePurchase = () => {
    // Navigate to purchase page with product ID
    navigate(`/products/${product.productId}`);
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image">
        {/* Render actual product image when available */}
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="image-placeholder"></div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-price">${product.price}</p>

        {/* Action Buttons */}
        <div className="product-actions">
          <button className="purchase-button" onClick={handlePurchase}>
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
