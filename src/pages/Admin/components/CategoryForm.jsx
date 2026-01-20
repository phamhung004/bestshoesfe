import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../../services/api';
import './BrandForm.css';

const CategoryForm = ({ category, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    description: '',
    image: '',
    status: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        parentId: category.parentId || '',
        description: category.description || '',
        image: category.image || '',
        status: category.status !== undefined ? category.status : true
      });
    } else {
      setFormData({
        name: '',
        parentId: '',
        description: '',
        image: '',
        status: true
      });
    }
    setErrors({});
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên danh mục là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = { ...formData, name: formData.name.trim() };
      if (isEditing && category) {
        await categoryAPI.update(category.categoryId, payload);
        alert('Cập nhật danh mục thành công');
      } else {
        await categoryAPI.create(payload);
        alert('Thêm danh mục thành công');
      }
      onSave();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-container">
        <div className="brand-form-header">
          <h2 className="form-title">{isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
          <button onClick={onCancel} className="btn-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Tên danh mục <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`form-input ${errors.name ? 'error' : ''}`} />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-textarea" rows="3" />
            </div>

            <div className="form-group">
              <label className="form-label">Hình ảnh URL</label>
              <input type="url" name="image" value={formData.image} onChange={handleInputChange} className="form-input" />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} />
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

export default CategoryForm;


