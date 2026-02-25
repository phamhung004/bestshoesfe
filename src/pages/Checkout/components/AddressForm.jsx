import React from 'react';
import { PROVINCES, DISTRICTS, WARDS } from '../mockCheckoutData';

const AddressForm = ({ formData, errors, touched, onChange, onBlur }) => {
    const getSelectClass = (field) => {
        if (errors[field] && touched[field]) return 'co-form-select error';
        if (touched[field] && !errors[field] && formData[field]) return 'co-form-select valid';
        return 'co-form-select';
    };

    const getInputClass = (field) => {
        if (errors[field] && touched[field]) return 'co-form-input error';
        if (touched[field] && !errors[field] && formData[field]) return 'co-form-input valid';
        return 'co-form-input';
    };

    const currentDistricts = formData.province ? (DISTRICTS[formData.province] || []) : [];
    const currentWards = formData.district ? (WARDS[formData.district] || []) : [];

    const allFilled = formData.province && formData.district && formData.ward && formData.street;

    return (
        <div className="co-card co-stagger-4">
            <h3 className="co-card-title">Địa chỉ giao hàng</h3>

            {/* Province */}
            <div className="co-form-group">
                <label className="co-form-label">
                    Tỉnh/Thành phố <span className="required">*</span>
                </label>
                <select
                    className={getSelectClass('province')}
                    value={formData.province}
                    onChange={(e) => {
                        onChange('province', e.target.value);
                        onChange('district', '');
                        onChange('ward', '');
                    }}
                    onBlur={() => onBlur('province')}
                >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                {errors.province && touched.province && (
                    <p className="co-form-error">⚠ {errors.province}</p>
                )}
            </div>

            {/* District */}
            <div className="co-form-group">
                <label className="co-form-label">
                    Quận/Huyện <span className="required">*</span>
                </label>
                <select
                    className={getSelectClass('district')}
                    value={formData.district}
                    onChange={(e) => {
                        onChange('district', e.target.value);
                        onChange('ward', '');
                    }}
                    onBlur={() => onBlur('district')}
                    disabled={!formData.province}
                >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {currentDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                {errors.district && touched.district && (
                    <p className="co-form-error">⚠ {errors.district}</p>
                )}
            </div>

            {/* Ward */}
            <div className="co-form-group">
                <label className="co-form-label">
                    Phường/Xã <span className="required">*</span>
                </label>
                <select
                    className={getSelectClass('ward')}
                    value={formData.ward}
                    onChange={(e) => onChange('ward', e.target.value)}
                    onBlur={() => onBlur('ward')}
                    disabled={!formData.district}
                >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {currentWards.map((w) => (
                        <option key={w} value={w}>{w}</option>
                    ))}
                </select>
                {errors.ward && touched.ward && (
                    <p className="co-form-error">⚠ {errors.ward}</p>
                )}
            </div>

            {/* Street address */}
            <div className="co-form-group">
                <label className="co-form-label">
                    Số nhà, tên đường <span className="required">*</span>
                </label>
                <input
                    type="text"
                    className={getInputClass('street')}
                    placeholder="VD: 123 Đường Lê Lợi"
                    value={formData.street}
                    onChange={(e) => onChange('street', e.target.value)}
                    onBlur={() => onBlur('street')}
                />
                {errors.street && touched.street && (
                    <p className="co-form-error">⚠ {errors.street}</p>
                )}
            </div>

            {/* Estimated shipping pill */}
            {allFilled && (
                <div className="co-shipping-pill">
                    🚚 Giao hàng dự kiến: 3–5 ngày làm việc
                </div>
            )}
        </div>
    );
};

export default AddressForm;
