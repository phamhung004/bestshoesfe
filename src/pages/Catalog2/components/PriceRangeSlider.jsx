import React, { useState, useRef, useCallback, useEffect } from 'react';
import { formatVND } from '../mockCatalogData';

const MIN_PRICE = 0;
const MAX_PRICE = 5000000;

const PRESETS = [
    { label: 'Dưới 500k', min: 0, max: 500000 },
    { label: '500k–1tr', min: 500000, max: 1000000 },
    { label: '1tr–2tr', min: 1000000, max: 2000000 },
    { label: 'Trên 2tr', min: 2000000, max: 5000000 },
];

const PriceRangeSlider = ({ priceRange, onApply }) => {
    const [minVal, setMinVal] = useState(priceRange[0] || MIN_PRICE);
    const [maxVal, setMaxVal] = useState(priceRange[1] || MAX_PRICE);
    const [activePreset, setActivePreset] = useState(null);
    const trackRef = useRef(null);
    const draggingRef = useRef(null);

    // Clamp value between min and max
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    // Handle mouse/touch drag on thumbs
    const handleMouseDown = useCallback((thumb) => (e) => {
        e.preventDefault();
        draggingRef.current = thumb;

        const handleMove = (ev) => {
            if (!trackRef.current || !draggingRef.current) return;
            const rect = trackRef.current.getBoundingClientRect();
            const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const pct = (clientX - rect.left) / rect.width;
            const val = Math.round(clamp(pct * MAX_PRICE, MIN_PRICE, MAX_PRICE) / 10000) * 10000;

            if (draggingRef.current === 'min') {
                setMinVal(Math.min(val, maxVal - 10000));
            } else {
                setMaxVal(Math.max(val, minVal + 10000));
            }
            setActivePreset(null);
        };

        const handleUp = () => {
            draggingRef.current = null;
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleUp);
    }, [minVal, maxVal]);

    const handlePreset = (preset, idx) => {
        setMinVal(preset.min);
        setMaxVal(preset.max);
        setActivePreset(idx);
    };

    const handleInputChange = (type, value) => {
        const num = parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
        if (type === 'min') {
            setMinVal(clamp(num, MIN_PRICE, maxVal - 10000));
        } else {
            setMaxVal(clamp(num, minVal + 10000, MAX_PRICE));
        }
        setActivePreset(null);
    };

    const leftPct = (minVal / MAX_PRICE) * 100;
    const rightPct = 100 - (maxVal / MAX_PRICE) * 100;

    return (
        <div className="catalog-price-slider-container">
            {/* Dual range slider */}
            <div className="catalog-price-slider-track" ref={trackRef}>
                <div
                    className="catalog-price-slider-fill"
                    style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
                />
                <div
                    className="catalog-price-slider-thumb"
                    style={{ left: `${leftPct}%` }}
                    onMouseDown={handleMouseDown('min')}
                    onTouchStart={handleMouseDown('min')}
                    role="slider"
                    aria-label="Giá tối thiểu"
                    aria-valuenow={minVal}
                />
                <div
                    className="catalog-price-slider-thumb"
                    style={{ left: `${100 - rightPct}%` }}
                    onMouseDown={handleMouseDown('max')}
                    onTouchStart={handleMouseDown('max')}
                    role="slider"
                    aria-label="Giá tối đa"
                    aria-valuenow={maxVal}
                />
            </div>

            {/* Numeric inputs */}
            <div className="catalog-price-inputs">
                <div className="catalog-price-input-group">
                    <span className="catalog-price-label">Từ</span>
                    <input
                        className="catalog-price-input"
                        type="text"
                        value={new Intl.NumberFormat('vi-VN').format(minVal)}
                        onChange={(e) => handleInputChange('min', e.target.value)}
                    />
                </div>
                <span className="catalog-price-separator">—</span>
                <div className="catalog-price-input-group">
                    <span className="catalog-price-label">Đến</span>
                    <input
                        className="catalog-price-input"
                        type="text"
                        value={new Intl.NumberFormat('vi-VN').format(maxVal)}
                        onChange={(e) => handleInputChange('max', e.target.value)}
                    />
                </div>
            </div>

            {/* Quick presets */}
            <div className="catalog-price-presets">
                {PRESETS.map((p, i) => (
                    <button
                        key={i}
                        className={`catalog-price-preset ${activePreset === i ? 'active' : ''}`}
                        onClick={() => handlePreset(p, i)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Apply button */}
            <button
                className="catalog-price-apply-btn"
                onClick={() => onApply([minVal, maxVal])}
            >
                Áp dụng
            </button>
        </div>
    );
};

export default PriceRangeSlider;
