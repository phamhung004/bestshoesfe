import React, { useState, useEffect } from 'react';
import { formatVND, FREESHIP_THRESHOLD } from '../mockCartData';

const FreeShippingBar = ({ totalAmount }) => {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const isQualified = totalAmount >= FREESHIP_THRESHOLD;
    const progressPercent = Math.min((totalAmount / FREESHIP_THRESHOLD) * 100, 100);
    const remaining = FREESHIP_THRESHOLD - totalAmount;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedWidth(progressPercent);
        }, 300);
        return () => clearTimeout(timer);
    }, [progressPercent]);

    return (
        <div className="cart-freeship-card">
            <div className="cart-freeship-header">
                <span>🚚</span>
                <span>Miễn phí vận chuyển</span>
            </div>

            {isQualified ? (
                <div className="cart-freeship-text qualified">
                    🎉 Bạn đã được FREESHIP!
                </div>
            ) : (
                <div className="cart-freeship-text">
                    Mua thêm <span className="amount">{formatVND(remaining)}</span> để được <strong>FREESHIP</strong> 🎉
                </div>
            )}

            <div className="cart-freeship-bar-track">
                <div
                    className={`cart-freeship-bar-fill ${isQualified ? 'complete' : 'progress'}`}
                    style={{ width: `${animatedWidth}%` }}
                />
            </div>

            {isQualified && (
                <div className="cart-freeship-confetti">🎊</div>
            )}
        </div>
    );
};

export default FreeShippingBar;
