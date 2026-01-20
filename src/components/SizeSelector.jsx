import React, { useState, useEffect } from 'react';
import './SizeSelector.css';

const SizeSelector = ({ sizes = [], selectedSize, onSizeChange }) => {
  const [internalSelectedSize, setInternalSelectedSize] = useState(selectedSize || null);

  useEffect(() => {
    setInternalSelectedSize(selectedSize || null);
  }, [selectedSize]);

  // If no sizes provided, use default
  const defaultSizes = ['38', '39', '40', '41', '42', '43'];
  const availableSizes = sizes.length > 0 ? sizes : defaultSizes;

  const handleSizeSelect = (size) => {
    setInternalSelectedSize(size);
    if (onSizeChange) {
      onSizeChange(size);
    }
  };

  // Split sizes into rows for layout
  const midPoint = Math.ceil(availableSizes.length / 2);
  const sizesRow1 = availableSizes.slice(0, midPoint);
  const sizesRow2 = availableSizes.slice(midPoint);

  return (
    <div className="size-selector">
      <div className="size-row">
        {sizesRow1.map((size) => (
          <button
            key={size}
            className={`size-button ${internalSelectedSize === size ? 'size-button-selected' : ''}`}
            onClick={() => handleSizeSelect(size)}
          >
            {size}
          </button>
        ))}
      </div>
      {sizesRow2.length > 0 && (
        <div className="size-row">
          {sizesRow2.map((size) => (
            <button
              key={size}
              className={`size-button ${internalSelectedSize === size ? 'size-button-selected' : ''}`}
              onClick={() => handleSizeSelect(size)}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SizeSelector;
