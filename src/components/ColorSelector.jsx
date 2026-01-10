import React, { useState } from 'react';
import './ColorSelector.css';

const ColorSelector = () => {
  const [selectedColor, setSelectedColor] = useState(null);

  const colors = [
    { name: 'red', hex: '#BE2A2A' },
    { name: 'blue', hex: '#2576C1' },
    { name: 'pink', hex: '#E675F9' },
    { name: 'green', hex: '#31DC43' },
    { name: 'yellow', hex: '#EEE864' },
    { name: 'orange', hex: '#E84B09' }
  ];

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
  };

  return (
    <div className="color-selector">
      <div className="color-options">
        {colors.map((color) => (
          <button
            key={color.name}
            className={`color-button ${selectedColor === color.name ? 'color-button-selected' : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => handleColorSelect(color.name)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
