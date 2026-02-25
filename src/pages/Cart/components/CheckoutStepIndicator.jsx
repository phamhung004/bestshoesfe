import React from 'react';

const steps = [
    { num: 1, label: 'Giỏ hàng' },
    { num: 2, label: 'Thanh toán' },
    { num: 3, label: 'Hoàn tất' },
];

const CheckoutStepIndicator = ({ activeStep = 1 }) => {
    return (
        <div className="cart-step-indicator">
            {steps.map((step, idx) => (
                <React.Fragment key={step.num}>
                    <div className="cart-step">
                        <div className={`cart-step-circle ${step.num <= activeStep ? 'active' : 'inactive'}`}>
                            {step.num}
                        </div>
                        <span className={`cart-step-label ${step.num <= activeStep ? 'active' : 'inactive'}`}>
                            {step.label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="cart-step-line">
                            <div className={`cart-step-line-inner ${step.num < activeStep ? 'active' : step.num === activeStep ? 'active' : 'inactive'}`} />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default CheckoutStepIndicator;
