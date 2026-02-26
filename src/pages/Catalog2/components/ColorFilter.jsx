import React from 'react';

/**
 * ColorFilter — accepts `colors` prop from real API (ColorDTO[]).
 * Each color: { colorId, colorName, colorCode }
 * selectedColors: number | null (single-select)
 */
const ColorFilter = ({ selectedColors, onToggle, colors = [] }) => {
    const selectedId = Array.isArray(selectedColors)
        ? selectedColors[0]
        : selectedColors;

    // Determine if a color is "light" to show darker border
    const isLight = (hex) => {
        if (!hex || !hex.startsWith('#')) return false;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 200;
    };

    if (colors.length === 0) return <p style={{ color: '#999', fontSize: 13 }}>Đang tải...</p>;

    return (
        <div className="catalog-color-dots">
            {colors.map(color => {
                const isSelected = selectedId === color.colorId;
                const lightColor = isLight(color.colorCode);

                return (
                    <div key={color.colorId} className="catalog-color-dot-wrapper">
                        <button
                            className={`catalog-color-dot ${isSelected ? 'selected' : ''} ${lightColor ? 'light-color' : ''}`}
                            style={{ backgroundColor: color.colorCode || '#999' }}
                            onClick={() => onToggle(color.colorId)}
                            aria-label={color.colorName}
                        >
                            {isSelected && (
                                <span className="checkmark" style={{ color: lightColor ? '#333' : '#fff' }}>✓</span>
                            )}
                        </button>
                        <span className="catalog-color-tooltip">{color.colorName}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ColorFilter;
