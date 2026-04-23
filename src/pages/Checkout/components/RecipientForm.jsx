import React from 'react';

const RecipientForm = ({ formData, errors, touched, onChange, onBlur, isGuest }) => {
    const getFieldClass = (field) => {
        if (errors[field] && touched[field]) return 'co-form-input error';
        if (touched[field] && !errors[field] && formData[field]) return 'co-form-input valid';
        return 'co-form-input';
    };

    return (
        <div className="co-card co-stagger-3">
            <h3 className="co-card-title">Thông tin người nhận</h3>
            <p className="co-card-subtitle">Thông tin này sẽ được dùng để liên hệ giao hàng</p>

            {/* Họ và tên */}
            <div className="co-form-group">
                <label className="co-form-label">
                    Họ và tên người nhận <span className="required">*</span>
                </label>
                <input
                    type="text"
                    className={getFieldClass('customerName')}
                    placeholder="Nguyễn Văn A"
                    value={formData.customerName}
                    onChange={(e) => onChange('customerName', e.target.value)}
                    onBlur={() => onBlur('customerName')}
                />
                {errors.customerName && touched.customerName && (
                    <p className="co-form-error">⚠ {errors.customerName}</p>
                )}
            </div>

            {/* Số điện thoại */}
            <div className="co-form-group">
                <label className="co-form-label">
                    Số điện thoại <span className="required">*</span>
                </label>
                <input
                    type="tel"
                    className={getFieldClass('customerPhone')}
                    placeholder="0912 345 678"
                    value={formData.customerPhone}
                    onChange={(e) => {
                        // Auto format phone spaces
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 10) val = val.slice(0, 10);
                        if (val.length > 4) {
                            val = val.slice(0, 4) + ' ' + val.slice(4);
                        }
                        if (val.length > 8) {
                            val = val.slice(0, 8) + ' ' + val.slice(8);
                        }
                        onChange('customerPhone', val);
                    }}
                    onBlur={() => onBlur('customerPhone')}
                />
                {errors.customerPhone && touched.customerPhone ? (
                    <p className="co-form-error">⚠ {errors.customerPhone}</p>
                ) : (
                    <p className="co-form-helper">Chúng tôi sẽ gọi số này để xác nhận đơn hàng</p>
                )}
            </div>

            {/* Email */}
            <div className="co-form-group">
                <label className="co-form-label">
                    Email {isGuest && <span className="required">*</span>}
                </label>
                <input
                    type="email"
                    className={getFieldClass('email')}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    onBlur={() => onBlur('email')}
                />
                {errors.email && touched.email ? (
                    <p className="co-form-error">⚠ {errors.email}</p>
                ) : (
                    <p className="co-form-helper">
                        {isGuest
                            ? 'Nhận mã đơn hàng và thông tin tra cứu qua email'
                            : 'Nhận xác nhận đơn hàng qua email'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RecipientForm;
