import React, { useState, useEffect } from 'react';
import { materialAPI } from '../../../services/api';
import './BrandForm.css';

const MaterialForm = ({ material, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    materialCode: '',
    materialName: '',
    status: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (material) {
      setFormData({
        materialCode: material.materialCode || '',
        materialName: material.materialName || '',
        status: material.status !== undefined ? material.status : true
      });
    } else {
      setFormData({ materialCode: '', materialName: '', status: true });
    }
    setErrors({});
  }, [material]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.materialName.trim()) newErrors.materialName = 'Tên chất liệu là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...formData, materialName: formData.materialName.trim() };
      if (isEditing && material) {
        await materialAPI.update(material.materialId, payload);
        alert('Cập nhật thành công');
      } else {
        await materialAPI.create(payload);
        alert('Thêm thành công');
      }
      onSave();
    } catch (err) {
      console.error('Error saving material:', err);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-container">
        <div className="brand-form-header">
          <h2 className="form-title">{isEditing ? 'Chỉnh sửa chất liệu' : 'Thêm chất liệu mới'}</h2>
          <button onClick={onCancel} className="btn-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mã chất liệu</label>
              <input type="text" name="materialCode" value={formData.materialCode} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Tên chất liệu <span className="required">*</span></label>
              <input type="text" name="materialName" value={formData.materialName} onChange={handleChange} className={`form-input ${errors.materialName ? 'error' : ''}`} />
              {errors.materialName && <span className="error-message">{errors.materialName}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="status" checked={formData.status} onChange={handleChange} />
                <span className="checkbox-text">Kích hoạt</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">Hủy</button>
            <button type="submit" disabled={loading} className="btn-submit">{loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialForm;


