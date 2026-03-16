import React, { useState } from 'react';
import './SortControls.css';
import { SORT_OPTIONS } from '../constants/vi';

const SortControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setIsOpen(false);
  };

  return (
    <div className="sort-controls">
      <div className="sort-dropdown" onClick={() => setIsOpen(!isOpen)}>
        <span className="sort-label">Sắp xếp: {selectedSort}</span>
        <div className={`sort-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </div>
      </div>

      {isOpen && (
        <div className="sort-options">
          {SORT_OPTIONS.map((option) => (
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
