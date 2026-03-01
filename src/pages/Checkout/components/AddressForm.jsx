import React, { useEffect } from 'react';
import { useProvinces } from '../../../hooks/useProvinces';

const AddressForm = ({ formData, errors, touched, onChange, onBlur }) => {
    const {
        provinces,
        districts,
        wards,
        fetchProvinces,
        fetchDistricts,
        fetchWards,
        loadingProvinces,
        loadingDistricts,
        loadingWards,
    } = useProvinces();

    // Fetch provinces on mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (formData.provinceCode) {
            fetchDistricts(formData.provinceCode);
        }
    }, [formData.provinceCode]);

    // Fetch wards when district changes
    useEffect(() => {
        if (formData.districtCode) {
            fetchWards(formData.districtCode);
        }
    }, [formData.districtCode]);

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
                    value={formData.provinceCode}
                    onChange={(e) => {
                        const code = e.target.value;
                        const selected = provinces.find((p) => String(p.code) === code);
                        onChange('provinceCode', code);
                        onChange('province', selected ? selected.name : '');
                        // Reset district & ward
                        onChange('districtCode', '');
                        onChange('district', '');
                        onChange('ward', '');
                    }}
                    onBlur={() => onBlur('province')}
                    disabled={loadingProvinces}
                >
                    <option value="">
                        {loadingProvinces ? 'Đang tải...' : '-- Chọn Tỉnh/Thành phố --'}
                    </option>
                    {provinces.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
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
                    value={formData.districtCode}
                    onChange={(e) => {
                        const code = e.target.value;
                        const selected = districts.find((d) => String(d.code) === code);
                        onChange('districtCode', code);
                        onChange('district', selected ? selected.name : '');
                        // Reset ward
                        onChange('ward', '');
                    }}
                    onBlur={() => onBlur('district')}
                    disabled={!formData.provinceCode || loadingDistricts}
                >
                    <option value="">
                        {loadingDistricts ? 'Đang tải...' : '-- Chọn Quận/Huyện --'}
                    </option>
                    {districts.map((d) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
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
                    disabled={!formData.districtCode || loadingWards}
                >
                    <option value="">
                        {loadingWards ? 'Đang tải...' : '-- Chọn Phường/Xã --'}
                    </option>
                    {wards.map((w) => (
                        <option key={w.code} value={w.name}>{w.name}</option>
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
