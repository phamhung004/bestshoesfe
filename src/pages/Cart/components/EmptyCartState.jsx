import React from 'react';
import { Link } from 'react-router-dom';
import { formatVND } from '../mockCartData';

const EmptyCartState = () => {
    const recentOrders = [
        { order_number: '#BS-20260215', total: 5600000, status: 'Đã giao', statusClass: 'delivered' },
        { order_number: '#BS-20260208', total: 3200000, status: 'Đang xử lý', statusClass: 'processing' },
    ];

    return (
        <div className="cart-empty-state">
            {/* Floating shopping bag icon */}
            <div className="cart-empty-icon">
                <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="80" height="70" rx="8" stroke="#6366F1" strokeWidth="3" fill="none" />
                    <path d="M40 45V30C40 19 49 10 60 10C71 10 80 19 80 30V45" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <circle cx="45" cy="60" r="4" fill="#6366F1" opacity="0.3" />
                    <circle cx="75" cy="60" r="4" fill="#6366F1" opacity="0.3" />
                    <path d="M47 78C47 78 53 85 60 85C67 85 73 78 73 78" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
                </svg>
            </div>

            <h2 className="cart-empty-title">Giỏ hàng của bạn đang trống</h2>
            <p className="cart-empty-subtitle">
                Hãy khám phá hàng nghìn đôi giày tuyệt vời và thêm vào giỏ hàng nhé!
            </p>

            <div className="cart-empty-buttons">
                <Link to="/catalog" className="cart-empty-btn primary">
                    Khám phá sản phẩm →
                </Link>
                <Link to="/catalog" className="cart-empty-btn outlined">
                    Xem Flash Sale 🔥
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="cart-empty-recent">
                <div className="cart-empty-recent-title">Hoặc xem lại đơn hàng gần đây:</div>
                <div className="cart-empty-recent-cards">
                    {recentOrders.map((order, idx) => (
                        <div key={idx} className="cart-empty-recent-card">
                            <div className="cart-empty-recent-order-num">{order.order_number}</div>
                            <div className="cart-empty-recent-amount">{formatVND(order.total)}</div>
                            <div className="cart-empty-recent-bottom">
                                <span className={`cart-empty-recent-status ${order.statusClass}`}>
                                    {order.status}
                                </span>
                                <button className="cart-empty-rebuy-btn">Mua lại</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmptyCartState;
