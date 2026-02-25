import React from 'react';
import { COLORS } from '../mockCatalogData';

const ColorFilter = ({ selectedColors, onToggle }) => {
    // Determine if a color is "light" to show a darker border
    const isLight = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 200;
    };

    return (
        <div className="catalog-color-dots">
            {COLORS.map(color => {
                const isSelected = selectedColors.includes(color.color_id);
                const lightColor = isLight(color.color_code);

                return (
                    <div key={color.color_id} className="catalog-color-dot-wrapper">
                        <button
                            className={`catalog-color-dot ${isSelected ? 'selected' : ''} ${lightColor ? 'light-color' : ''}`}
                            style={{ backgroundColor: color.color_code }}
                            onClick={() => onToggle(color.color_id)}
                            aria-label={color.color_name}
                        >
                            {isSelected && (
                                <span className="checkmark" style={{ color: lightColor ? '#333' : '#fff' }}>✓</span>
                            )}
                        </button>
                        <span className="catalog-color-tooltip">{color.color_name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ColorFilter;
