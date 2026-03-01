import React from 'react';
import { DELIVERY_OPTIONS } from '../checkoutConstants';

const DeliveryTimeSelector = ({ selectedTime, onSelect }) => {
    return (
        <div className="co-card co-stagger-5">
            <h3 className="co-card-title">Thời gian giao hàng</h3>

            <div className="co-time-grid">
                {DELIVERY_OPTIONS.map((opt) => (
                    <div
                        key={opt.id}
                        className={`co-time-card ${selectedTime === opt.id ? 'selected' : ''}`}
                        onClick={() => onSelect(opt.id)}
                    >
                        <div className="co-time-card-left">
                            <h4>{opt.label}</h4>
                            <p>{opt.desc}</p>
                        </div>
                        <span className={`co-time-card-cost ${opt.cost === 0 ? 'free' : 'paid'}`}>
                            {opt.costLabel}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeliveryTimeSelector;
