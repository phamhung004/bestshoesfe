import React, { useState } from 'react';
import './SizeSelector.css';

const SizeSelector = () => {
  const [selectedSize, setSelectedSize] = useState(null);

  const sizesRow1 = [35, 36, 37, 38, 39, 40];
  const sizesRow2 = [42, 43, 44, 45, 46];

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  return (
    <div className="size-selector">
      <div className="size-row">
        {sizesRow1.map((size) => (
          <button
            key={size}
            className={`size-button ${selectedSize === size ? 'size-button-selected' : ''}`}
            onClick={() => handleSizeSelect(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="size-row">
        {sizesRow2.map((size) => (
          <button
            key={size}
            className={`size-button ${selectedSize === size ? 'size-button-selected' : ''}`}
            onClick={() => handleSizeSelect(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
