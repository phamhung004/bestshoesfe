// --- ADDED: OutOfStock Banner ---
// Reusable inline error banner shown above the "Đặt hàng ngay" button
// when one or more cart items have insufficient stock.

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * OutOfStockBanner
 *
 * @param {Array}   outOfStockItems  - Array of { productId, name, remaining }
 * @param {boolean} pulse            - When true, triggers the shake/pulse animation
 * @param {function} onPulseEnd      - Called after animation ends so parent can reset pulse flag
 */
const OutOfStockBanner = ({ outOfStockItems = [], pulse = false, onPulseEnd }) => {
    const bannerRef = useRef(null);

    // Reset the animation class after it finishes so it can be re-triggered
    useEffect(() => {
        if (!pulse || !bannerRef.current) return;
        const el = bannerRef.current;
        el.classList.add('co-oos-banner--shake');
        const handleAnimEnd = () => {
            el.classList.remove('co-oos-banner--shake');
            if (onPulseEnd) onPulseEnd();
        };
        el.addEventListener('animationend', handleAnimEnd, { once: true });
        return () => el.removeEventListener('animationend', handleAnimEnd);
    }, [pulse, onPulseEnd]);

    if (!outOfStockItems || outOfStockItems.length === 0) return null;

    return (
        <div className="co-oos-banner" ref={bannerRef} role="alert" aria-live="assertive">
            <div className="co-oos-banner__icon" aria-hidden="true">⚠️</div>
            <div className="co-oos-banner__body">
                {outOfStockItems.map((item) => (
                    <p key={item.productId || item.name} className="co-oos-banner__msg">
                        Sản phẩm{' '}
                        <strong>"{item.name}"</strong>{' '}
                        vừa hết hàng (còn lại: {item.remaining}).{' '}
                        Vui lòng cập nhật giỏ hàng để tiếp tục đặt hàng.
                    </p>
                ))}
                <Link to="/cart" className="co-oos-banner__cta">
                    ← Cập nhật giỏ hàng
                </Link>
            </div>
        </div>
    );
};

export default OutOfStockBanner;
