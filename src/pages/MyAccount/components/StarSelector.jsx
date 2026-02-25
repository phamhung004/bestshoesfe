import React, { useState } from 'react';

const StarSelector = ({ value, onChange, size = 28, readOnly = false }) => {
    const [hovered, setHovered] = useState(0);

    const displayValue = hovered || value;

    return (
        <div
            className="acc-star-selector"
            onMouseLeave={() => !readOnly && setHovered(0)}
            style={{ '--star-size': `${size}px` }}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`acc-star-btn${displayValue >= star ? ' filled' : ''}${readOnly ? ' readonly' : ''}`}
                    style={{ fontSize: `${size}px`, width: `${size + 8}px`, height: `${size + 8}px` }}
                    onMouseEnter={() => !readOnly && setHovered(star)}
                    onClick={() => !readOnly && onChange && onChange(star)}
                    disabled={readOnly}
                    aria-label={`${star} sao`}
                >
                    {displayValue >= star ? '★' : '☆'}
                </button>
            ))}
        </div>
    );
};

export default StarSelector;
