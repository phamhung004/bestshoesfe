import React, { useState, useEffect } from 'react';
import './FilterSidebar.css';
import { categoryAPI, sizeAPI, colorAPI } from '../services/api';

const noop = () => {};

const FilterSidebar = ({ onApply = noop }) => {
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState([]);
  const [selectedColorIds, setSelectedColorIds] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [cats, szs, cols] = await Promise.all([
          categoryAPI.getAll(),
          sizeAPI.getAll(),
          colorAPI.getAll(),
        ]);
        setCategories(cats || []);
        setSizes(szs || []);
        setColors(cols || []);
      } catch (err) {
        console.error('Failed loading filter lookups', err);
      }
    };
    loadLookups();
  }, []);

  const toggleArrayValue = (arrSetter, arr, value) => {
    arrSetter(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  const handleApply = () => {
    onApply({
      categoryId: selectedCategoryIds,
      sizeId: selectedSizeIds,
      colorId: selectedColorIds,
      gender: selectedGenders,
      priceRange: selectedPrices,
    });
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
                key={color.colorId || color.name}
                className={`color-circle ${selectedColorIds.includes(color.colorId) ? 'selected' : ''}`}
                style={{ backgroundColor: color.colorHex || color.hex || '#ccc' }}
                title={color.colorName || color.name}
                onClick={() => toggleArrayValue(setSelectedColorIds, selectedColorIds, color.colorId)}
              />
            ))}
          </div>
        </div>

        {/* Category Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Category</h3>
          <div className="checkbox-options">
            {categories.map((category) => (
              <label key={category.categoryId} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.categoryId)}
                  onChange={() => toggleArrayValue(setSelectedCategoryIds, selectedCategoryIds, category.categoryId)}
                />
                <span className="checkmark"></span>
                <span className="option-text">{category.name || category.categoryName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gender Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Gender</h3>
          <div className="checkbox-options">
            {['Man', 'Female'].map((gender) => (
              <label key={gender} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedGenders.includes(gender)}
                  onChange={() => toggleArrayValue(setSelectedGenders, selectedGenders, gender)}
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
          <div className="checkbox-options">
            {sizes.map((size) => (
              <label key={size.sizeId} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedSizeIds.includes(size.sizeId)}
                  onChange={() => toggleArrayValue(setSelectedSizeIds, selectedSizeIds, size.sizeId)}
                />
                <span className="checkmark"></span>
                <span className="option-text">{size.sizeName || size.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Section */}
        <div className="filter-section">
          <h3 className="filter-section-title">Price</h3>
          <div className="checkbox-options">
            {['$0 - $50', '$50 - $100', '$100 - $500', '$500 +'].map((price) => (
              <label key={price} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedPrices.includes(price)}
                  onChange={() => toggleArrayValue(setSelectedPrices, selectedPrices, price)}
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
          <button className="apply-button" onClick={handleApply}>
            <span className="apply-text">Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
