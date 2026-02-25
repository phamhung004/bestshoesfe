import React from 'react';
import { SIZES } from '../mockCatalogData';

const SizeFilter = ({ selectedSizes, onToggle, availableSizes = [] }) => {
    return (
        <div className="catalog-size-grid">
            {SIZES.map(size => {
                const isSelected = selectedSizes.includes(size.size_id);
                // If availableSizes is empty, all sizes are available
                const isAvailable = availableSizes.length === 0 || availableSizes.includes(size.size_id);

                return (
                    <button
                        key={size.size_id}
                        className={`catalog-size-chip ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                        onClick={() => isAvailable && onToggle(size.size_id)}
                        disabled={!isAvailable}
                        aria-label={`Size ${size.size_name}`}
                    >
                        {size.size_name}
                    </button>
                );
            })}
        </div>
    );
};

export default SizeFilter;
