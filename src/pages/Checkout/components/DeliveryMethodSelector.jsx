import React from 'react';

const DeliveryMethodSelector = ({ deliveryMethod, onSelect }) => {
    return (
        <div className="co-card co-stagger-1">
            <h3 className="co-card-title">Hình thức nhận hàng</h3>

            <div className="co-delivery-grid">
                {/* Giao hàng tận nơi */}
                <div
                    className={`co-delivery-card ${deliveryMethod === 'Online' ? 'selected' : ''}`}
                    onClick={() => onSelect('Online')}
                >
                    {deliveryMethod === 'Online' && (
                        <span className="co-delivery-check">✓</span>
                    )}
                    <span className="co-delivery-card-icon">🚚</span>
                    <div className="co-delivery-card-text">
                        <h4>Giao hàng tận nơi</h4>
                        <p>Nhận hàng trong 2–5 ngày</p>
                    </div>
                </div>

                {/* Nhận tại cửa hàng */}
                <div
                    className={`co-delivery-card ${deliveryMethod === 'In-store' ? 'selected' : ''}`}
                    onClick={() => onSelect('In-store')}
                >
                    {deliveryMethod === 'In-store' && (
                        <span className="co-delivery-check">✓</span>
                    )}
                    <span className="co-delivery-card-icon">🏪</span>
                    <div className="co-delivery-card-text">
                        <h4>Nhận tại cửa hàng</h4>
                        <p>Miễn phí — Sẵn sàng trong 2 giờ</p>
                    </div>
                </div>
            </div>

            {/* Store info when In-store selected */}
            {deliveryMethod === 'In-store' && (
                <div className="co-store-info">
                    <div className="co-store-info-title">
                        📍 BestShoes Store — 1234 Shoe Street, Fashion City
                    </div>
                    <p>Giờ mở cửa: 8:00 – 21:00, Thứ 2 – Chủ nhật</p>
                </div>
            )}
        </div>
    );
};

export default DeliveryMethodSelector;
