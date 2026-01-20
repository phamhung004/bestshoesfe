import React from 'react';
import './ProductGallery.css';

const ProductGallery = ({ productData }) => {
  // Collect all images from all variants
  const allImages = productData.allImages || [];

  // If no images, show placeholders
  if (!allImages || allImages.length === 0) {
    return (
      <div className="product-gallery">
        <div className="gallery-row">
          <div className="gallery-item">
            <div className="gallery-image-placeholder"></div>
          </div>
          <div className="gallery-item">
            <div className="gallery-image-placeholder"></div>
          </div>
          <div className="gallery-item">
            <div className="gallery-image-placeholder"></div>
          </div>
          <div className="gallery-item">
            <div className="gallery-image-placeholder"></div>
          </div>
        </div>
      </div>
    );
  }

  // Sort images by sort_order, then by is_primary
  const sortedImages = [...allImages].sort((a, b) => {
    // Primary images first
    if ((a.isPrimary === true || a.isPrimary === 1) && !(b.isPrimary === true || b.isPrimary === 1)) {
      return -1;
    }
    if (!(a.isPrimary === true || a.isPrimary === 1) && (b.isPrimary === true || b.isPrimary === 1)) {
      return 1;
    }
    // Then by sort_order
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  // Take up to 4 images for the gallery
  const galleryImages = sortedImages.slice(0, 4);

  return (
    <div className="product-gallery">
      <div className="gallery-row">
        {galleryImages.map((image, index) => (
          <div key={image.imageId || index} className="gallery-item">
            <img
              src={image.imageUrl}
              alt={image.altText || `${productData.product.name} - Image ${index + 1}`}
              className="gallery-image"
            />
          </div>
        ))}
        {/* Fill remaining slots with placeholders if needed */}
        {Array.from({ length: Math.max(0, 4 - galleryImages.length) }, (_, index) => (
          <div key={`placeholder-${index}`} className="gallery-item">
            <div className="gallery-image-placeholder"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
