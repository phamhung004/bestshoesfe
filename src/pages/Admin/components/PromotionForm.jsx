import React, { useState, useEffect } from 'react';
import { promotionAPI } from '../../../services/api';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import './PromotionForm.css';

const PromotionForm = ({ promotion, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'seasonal',
    discountPercentage: '',
    discountAmount: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || '',
        description: promotion.description || '',
        type: promotion.type || 'seasonal',
        discountPercentage: promotion.discountPercentage || '',
        discountAmount: promotion.discountAmount || '',
        startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : '',
        endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : '',
        isActive: promotion.isActive !== undefined ? promotion.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'seasonal',
        discountPercentage: '',
        discountAmount: '',
        startDate: '',
        endDate: '',
        isActive: true
      });
    }
    setErrors({});
  }, [promotion]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên đợt giảm giá là bắt buộc';
    }

    if (!formData.discountPercentage && !formData.discountAmount) {
      newErrors.discountPercentage = 'Vui lòng nhập ít nhất một loại giảm giá';
      newErrors.discountAmount = 'Vui lòng nhập ít nhất một loại giảm giá';
    }

    if (formData.discountPercentage && parseFloat(formData.discountPercentage) <= 0) {
      newErrors.discountPercentage = 'Phần trăm giảm giá phải lớn hơn 0';
    } else if (formData.discountPercentage && parseFloat(formData.discountPercentage) > 100) {
      newErrors.discountPercentage = 'Phần trăm giảm giá không được vượt quá 100%';
    }

    if (formData.discountAmount && parseFloat(formData.discountAmount) <= 0) {
      newErrors.discountAmount = 'Số tiền giảm phải lớn hơn 0';
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
      const promotionData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      let result;
      if (isEditing && promotion) {
        result = await promotionAPI.update(promotion.promotionId, promotionData);
        alert('Cập nhật đợt giảm giá thành công!');
      } else {
        result = await promotionAPI.create(promotionData);
        alert('Thêm đợt giảm giá thành công!');
      }

      onSave(result);
    } catch (error) {
      console.error('Error saving promotion:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeDescription = (type) => {
    switch (type) {
      case 'flash_sale':
        return 'Giảm giá trong thời gian ngắn, thường từ vài giờ đến 1 ngày';
      case 'seasonal':
        return 'Giảm giá theo mùa như mùa hè, mùa đông, lễ hội...';
      case 'clearance':
        return 'Giảm giá để thanh lý hàng tồn kho';
      case 'special':
        return 'Giảm giá đặc biệt cho dịp đặc biệt';
      default:
        return '';
    }
  };

  return (
    <div className="promotion-form-overlay">
      <div className="promotion-form-container">
        <div className="promotion-form-header">
          <h2 className="form-title">
            {isEditing ? 'Chỉnh sửa đợt giảm giá' : 'Thêm đợt giảm giá mới'}
          </h2>
          <button onClick={onCancel} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="promotion-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="name" className="form-label">
                Tên đợt giảm giá <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Ví dụ: Giảm giá mùa hè 2024"
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
                placeholder="Mô tả chi tiết về đợt giảm giá..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Loại đợt giảm giá
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="flash_sale">Flash Sale</option>
                <option value="seasonal">Theo mùa</option>
                <option value="clearance">Thanh lý</option>
                <option value="special">Đặc biệt</option>
              </select>
              <small className="form-hint">
                {getTypeDescription(formData.type)}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="discountPercentage" className="form-label">
                Phần trăm giảm (%)
              </label>
              <input
                type="number"
                id="discountPercentage"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                className={`form-input ${errors.discountPercentage ? 'error' : ''}`}
                placeholder="Ví dụ: 20"
                min="0"
                max="100"
                step="0.01"
              />
              {errors.discountPercentage && <span className="error-message">{errors.discountPercentage}</span>}
              <small className="form-hint">
                Để trống nếu không áp dụng giảm theo phần trăm
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="discountAmount" className="form-label">
                Số tiền giảm (VND)
              </label>
              <input
                type="number"
                id="discountAmount"
                name="discountAmount"
                value={formData.discountAmount}
                onChange={handleInputChange}
                className={`form-input ${errors.discountAmount ? 'error' : ''}`}
                placeholder="Ví dụ: 50000"
                min="0"
                step="1000"
              />
              {errors.discountAmount && <span className="error-message">{errors.discountAmount}</span>}
              <small className="form-hint">
                Để trống nếu không áp dụng giảm theo số tiền
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
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <span className="checkbox-text">Kích hoạt đợt giảm giá</span>
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
        title={isEditing ? 'Xác nhận cập nhật' : 'Xác nhận thêm đợt giảm giá'}
        message={isEditing
          ? 'Bạn có chắc chắn muốn cập nhật đợt giảm giá này không?'
          : 'Bạn có chắc chắn muốn thêm đợt giảm giá mới không?'}
        confirmText={isEditing ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        loading={loading}
      />
    </div>
  );
};

export default PromotionForm;

