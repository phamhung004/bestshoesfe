import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedSize, setSelectedSize] = useState(38);

  const colors = [
    { name: 'red', hex: '#BE2A2A' },
    { name: 'blue', hex: '#2576C1' },
    { name: 'pink', hex: '#E675F9' },
    { name: 'green', hex: '#31DC43' },
    { name: 'yellow', hex: '#EEE864' },
    { name: 'orange', hex: '#E84B09' }
  ];

  const categories = ['Casual', 'Sports', 'Formal', 'Sandals', 'Outdoor'];
  const genders = ['Man', 'Female'];
  const prices = ['$0 - $50', '$50 - $100', '$100 - $500', '$500 +'];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleGender = (gender) => {
    setSelectedGenders(prev =>
      prev.includes(gender)
        ? prev.filter(g => g !== gender)
        : [...prev, gender]
    );
  };

  const togglePrice = (price) => {
    setSelectedPrices(prev =>
      prev.includes(price)
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <div className="filter-sidebar">
      {/* Header */}
      <div className="filter-header">
        <h2 className="filter-title">Shoes Filter</h2>
      </div>

      <div className="filter-content">
        {/* Color Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Color</h3>
          <div className="color-options">
            {colors.map((color) => (
              <div
                key={color.name}
                className="color-circle"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Category Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Category</h3>
          <div className="checkbox-options">
            {categories.map((category) => (
              <label key={category} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                <span className="checkmark"></span>
                <span className="option-text">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gender Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Gender</h3>
          <div className="checkbox-options">
            {genders.map((gender) => (
              <label key={gender} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedGenders.includes(gender)}
                  onChange={() => toggleGender(gender)}
                />
                <span className="checkmark"></span>
                <span className="option-text">{gender}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Size Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Size</h3>
          <div className="size-slider-container">
            <div className="size-slider">
              <div className="slider-track">
                <div className="slider-fill"></div>
                <div className="slider-thumb">
                  <div className="slider-arrow">▶</div>
                </div>
              </div>
            </div>
            <div className="size-value">{selectedSize}</div>
          </div>
        </div>

        {/* Price Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Price</h3>
          <div className="checkbox-options">
            {prices.map((price) => (
              <label key={price} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(price)}
                  onChange={() => togglePrice(price)}
                />
                <span className="checkmark"></span>
                <span className="option-text">{price}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rate Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Rate</h3>
          <div className="rating-options">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="rating-option">
                {renderStars(rating)}
              </div>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <div className="filter-actions">
          <button className="apply-button">
            <span className="apply-text">Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
