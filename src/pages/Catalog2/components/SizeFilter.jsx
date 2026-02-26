import React from 'react';

/**
 * SizeFilter — accepts `sizes` prop from real API (string[]).
 * e.g. ["35","36","37","38","39","40","41","42"]
 * selectedSizes: string | null (single-select, matches API sizeName param)
 */
const SizeFilter = ({ selectedSizes, onToggle, sizes = [] }) => {
    // Support single string or array for backward compatibility
    const selectedSet = Array.isArray(selectedSizes)
        ? selectedSizes
        : selectedSizes != null ? [selectedSizes] : [];

    if (sizes.length === 0) return <p style={{ color: '#999', fontSize: 13 }}>Đang tải...</p>;

    return (
        <div className="catalog-size-grid">
            {sizes.map(size => {
                const isSelected = selectedSet.includes(size);

                return (
                    <button
                        key={size}
                        className={`catalog-size-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => onToggle(size)}
                        aria-label={`Size ${size}`}
                    >
                        {size}
                    </button>
                );
            })}
        </div>
    );
};

export default SizeFilter;
