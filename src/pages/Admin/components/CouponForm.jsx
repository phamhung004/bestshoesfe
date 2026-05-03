import React, { useState, useEffect } from 'react';
import { couponAPI } from '../../../services/api';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import './CouponForm.css';

const CouponForm = ({ coupon, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'Percentage',
    value: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    status: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        name: coupon.name || '',
        description: coupon.description || '',
        type: coupon.type || 'Percentage',
        value: coupon.value || '',
        minimumAmount: coupon.minimumAmount || '',
        maximumDiscount: coupon.maximumDiscount || '',
        usageLimit: coupon.usageLimit || '',
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
        status: coupon.status !== undefined ? coupon.status : true
      });
    } else {
      // Reset form for new coupon
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'Percentage',
        value: '',
        minimumAmount: '',
        maximumDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        status: true
      });
    }
    setErrors({});
  }, [coupon]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Auto-generate code from name if not editing
    if (name === 'name' && !isEditing && !formData.code) {
      const generatedCode = generateCode(value);
      setFormData(prev => ({
        ...prev,
        code: generatedCode
      }));
    }
  };

  const generateCode = (name) => {
    if (!name) return '';
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') // Remove special characters and spaces
      .substring(0, 10); // Limit to 10 characters
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Mã giảm giá là bắt buộc';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Mã giảm giá chỉ được chứa chữ cái in hoa và số';
    } else if (formData.code.length < 3 || formData.code.length > 50) {
      newErrors.code = 'Mã giảm giá phải có độ dài từ 3 đến 50 ký tự';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Tên mã giảm giá là bắt buộc';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Tên mã giảm giá không được vượt quá 255 ký tự';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Giá trị giảm giá phải lớn hơn 0';
    } else if (formData.type === 'Percentage' && formData.value > 100) {
      newErrors.value = 'Phần trăm giảm giá không được vượt quá 100%';
    } else if (formData.type === 'Fixed Amount' && formData.value > 10000000) {
      newErrors.value = 'Số tiền giảm giá tối đa là 10,000,000 VND';
    }

    if (formData.minimumAmount && formData.minimumAmount < 0) {
      newErrors.minimumAmount = 'Đơn hàng tối thiểu không được âm';
    }

    if (formData.maximumDiscount && formData.maximumDiscount < 0) {
      newErrors.maximumDiscount = 'Giảm giá tối đa không được âm';
    }

    if (formData.usageLimit && formData.usageLimit < 0) {
      newErrors.usageLimit = 'Số lần sử dụng không được âm';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    // Check if start date is in the future (at least 1 minute from now)
    if (formData.startDate && !isEditing) {
      const start = new Date(formData.startDate);
      const now = new Date();
      const oneMinuteLater = new Date(now.getTime() + 60000);
      
      if (start < oneMinuteLater) {
        newErrors.startDate = 'Ngày bắt đầu phải ít nhất 1 phút trong tương lai';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      // Get current user ID from localStorage or sessionStorage
      const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const createdBy = user.userId || user.id || 1; // Default to 1 if no user ID

      const couponData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : null,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: formData.status,
        createdBy: createdBy
      };

      let result;
      if (isEditing && coupon) {
        result = await couponAPI.update(coupon.couponId, couponData);
        alert('Cập nhật mã giảm giá thành công!');
      } else {
        result = await couponAPI.create(couponData);
        alert('Thêm mã giảm giá thành công!');
      }

      onSave(result);
    } catch (error) {
      console.error('Error saving coupon:', error);
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      // Check if error has response data from our API
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (errorMessage.includes('đã tồn tại')) {
        setErrors({ code: 'Mã giảm giá đã tồn tại. Vui lòng chọn mã khác.' });
      } else if (errorMessage.includes('quá khứ')) {
        setErrors({ startDate: 'Ngày bắt đầu không được là ngày trong quá khứ' });
      } else if (errorMessage.includes('phải lớn hơn 0')) {
        setErrors({ value: 'Giá trị giảm giá phải lớn hơn 0' });
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getValuePlaceholder = () => {
    return formData.type === 'Percentage' ? 'Ví dụ: 10 (cho 10%)' : 'Ví dụ: 50000 (cho 50,000 VND)';
  };

  const getValueLabel = () => {
    return formData.type === 'Percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VND)';
  };

  return (
    <div className="coupon-form-overlay">
      <div className="coupon-form-container">
        <div className="coupon-form-header">
          <h2 className="form-title">
            {isEditing ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
          </h2>
          <button onClick={onCancel} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="coupon-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="code" className="form-label">
                Mã giảm giá <span className="required">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`form-input ${errors.code ? 'error' : ''}`}
                placeholder="SUMMER2024"
                maxLength="50"
                disabled={isEditing} // Don't allow editing code once created
              />
              {errors.code && <span className="error-message">{errors.code}</span>}
              <small className="form-hint">
                Chỉ chứa chữ cái in hoa và số. Mã này sẽ được khách hàng sử dụng.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Tên mã giảm giá <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Giảm giá mùa hè"
                maxLength="255"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="description" className="form-label">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Mô tả chi tiết về mã giảm giá..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Loại giảm giá <span className="required">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Percentage">Phần trăm (%)</option>
                <option value="Fixed Amount">Số tiền cố định (VND)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="value" className="form-label">
                {getValueLabel()} <span className="required">*</span>
              </label>
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className={`form-input ${errors.value ? 'error' : ''}`}
                placeholder={getValuePlaceholder()}
                min="0"
                step={formData.type === 'Percentage' ? '1' : '1000'}
              />
              {errors.value && <span className="error-message">{errors.value}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="minimumAmount" className="form-label">
                Đơn hàng tối thiểu (VND)
              </label>
              <input
                type="number"
                id="minimumAmount"
                name="minimumAmount"
                value={formData.minimumAmount}
                onChange={handleInputChange}
                className={`form-input ${errors.minimumAmount ? 'error' : ''}`}
                placeholder="Ví dụ: 500000"
                min="0"
                step="1000"
              />
              {errors.minimumAmount && <span className="error-message">{errors.minimumAmount}</span>}
              <small className="form-hint">
                Để trống nếu không giới hạn đơn hàng tối thiểu
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="maximumDiscount" className="form-label">
                Giảm tối đa (VND)
              </label>
              <input
                type="number"
                id="maximumDiscount"
                name="maximumDiscount"
                value={formData.maximumDiscount}
                onChange={handleInputChange}
                className={`form-input ${errors.maximumDiscount ? 'error' : ''}`}
                placeholder="Ví dụ: 100000"
                min="0"
                step="1000"
              />
              {errors.maximumDiscount && <span className="error-message">{errors.maximumDiscount}</span>}
              <small className="form-hint">
                Chỉ áp dụng cho giảm phần trăm. Để trống nếu không giới hạn
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="usageLimit" className="form-label">
                Số lần sử dụng tối đa
              </label>
              <input
                type="number"
                id="usageLimit"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                className={`form-input ${errors.usageLimit ? 'error' : ''}`}
                placeholder="Ví dụ: 100"
                min="0"
              />
              {errors.usageLimit && <span className="error-message">{errors.usageLimit}</span>}
              <small className="form-hint">
                Để trống nếu không giới hạn số lần sử dụng
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="startDate" className="form-label">
                Ngày bắt đầu <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`form-input ${errors.startDate ? 'error' : ''}`}
              />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate" className="form-label">
                Ngày kết thúc <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`form-input ${errors.endDate ? 'error' : ''}`}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <span className="checkbox-text">Kích hoạt mã giảm giá</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title={isEditing ? 'Xác nhận cập nhật' : 'Xác nhận thêm mã giảm giá'}
        message={isEditing
          ? 'Bạn có chắc chắn muốn cập nhật mã giảm giá này không?'
          : 'Bạn có chắc chắn muốn thêm mã giảm giá mới không?'}
        confirmText={isEditing ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        loading={loading}
      />
    </div>
  );
};

export default CouponForm;
