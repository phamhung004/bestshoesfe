import React from 'react';

const AvailabilityToggles = ({ availability, onToggle }) => {
    const toggles = [
        { key: 'inStock', label: 'Còn hàng', icon: '✓' },
        { key: 'onPromotion', label: 'Đang khuyến mãi', icon: '✓' },
        { key: 'newArrivals', label: 'Hàng mới về', icon: '✓' },
    ];

    return (
        <div className="catalog-toggle-list">
            {toggles.map(t => (
                <div key={t.key} className="catalog-toggle-row">
                    <span className="catalog-toggle-label">{t.label}</span>
                    <button
                        className={`catalog-toggle-switch ${availability[t.key] ? 'active' : ''}`}
                        onClick={() => onToggle(t.key)}
                        aria-label={t.label}
                    >
                        <span className="catalog-toggle-knob" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AvailabilityToggles;
