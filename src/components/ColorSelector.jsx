import React, { useState, useEffect } from 'react';
import './ColorSelector.css';

const ColorSelector = ({ colors = [], selectedColor, onColorChange }) => {
  const [internalSelectedColor, setInternalSelectedColor] = useState(selectedColor || null);

  useEffect(() => {
    setInternalSelectedColor(selectedColor || null);
  }, [selectedColor]);

  // Color mapping for common colors
  const colorMap = {
    'White': '#FFFFFF',
    'Black': '#000000',
    'Grey': '#808080',
    'Gray': '#808080',
    'Green': '#4CAF50',
    'Blue': '#2196F3',
    'Red': '#F44336',
    'Yellow': '#FFEB3B',
    'Pink': '#E91E63',
    'Purple': '#9C27B0',
    'Orange': '#FF9800',
    'Brown': '#795548'
  };

  // If no colors provided, use default
  const defaultColors = ['White', 'Black', 'Grey', 'Green'];
  const availableColors = colors.length > 0 ? colors : defaultColors;

  const handleColorSelect = (colorName) => {
    setInternalSelectedColor(colorName);
    if (onColorChange) {
      onColorChange(colorName);
    }
  };

  const getColorHex = (colorName) => {
    return colorMap[colorName] || '#CCCCCC'; // Default to light gray if not found
  };

  return (
    <div className="color-selector">
      <div className="color-options">
        {availableColors.map((colorName) => (
          <button
            key={colorName}
            className={`color-button ${internalSelectedColor === colorName ? 'color-button-selected' : ''}`}
            style={{ backgroundColor: getColorHex(colorName) }}
            onClick={() => handleColorSelect(colorName)}
            title={colorName}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
