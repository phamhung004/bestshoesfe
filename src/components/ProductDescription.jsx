import React from 'react';
import './ProductDescription.css';

const ProductDescription = ({ productData }) => {
  const { product } = productData;

  // Get additional images (beyond the first 4 shown in gallery)
  const allImages = productData.allImages || [];
  const additionalImages = allImages.slice(4, 6); // Show next 2 images

  return (
    <div className="product-description">
      <div className="description-container">
        <h2 className="description-title">Description</h2>
        <div className="description-content">
          <p className="description-text">
            {product.description || 'No description available for this product.'}
          </p>
        </div>

        {/* Product Details */}
        <div className="product-details">
          <div className="detail-row">
            <span className="detail-label">Brand:</span>
            <span className="detail-value">{product.brand?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{product.category?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Material:</span>
            <span className="detail-value">{product.material?.materialName || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Additional Images Section */}
      {additionalImages.length > 0 && (
        <div className="additional-images">
          <div className="images-row">
            {additionalImages.map((image, index) => (
              <div key={image.imageId || index} className="additional-image">
                <img
                  src={image.imageUrl}
                  alt={image.altText || `${product.name} - Additional Image ${index + 1}`}
                  className="additional-image-content"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDescription;
