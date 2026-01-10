import React, { useState } from 'react';
import './SortControls.css';

const SortControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Recommendation');

  const sortOptions = [
    'Recommendation',
    'Price: Low to High',
    'Price: High to Low',
    'Newest',
    'Rating'
  ];

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsOpen(false);
  };

  return (
    <div className="sort-controls">
      <div className="sort-dropdown" onClick={() => setIsOpen(!isOpen)}>
        <span className="sort-label">Sort by : {selectedSort}</span>
        <div className={`sort-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </div>
      </div>

      {isOpen && (
        <div className="sort-options">
          {sortOptions.map((option) => (
            <div
              key={option}
              className={`sort-option ${selectedSort === option ? 'selected' : ''}`}
              onClick={() => handleSortSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortControls;
