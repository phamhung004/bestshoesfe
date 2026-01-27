import React, { useState, useEffect } from "react";
import { colorAPI } from "../../../services/api";
import "./Brand/BrandForm.css";

const ColorForm = ({ color, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    colorName: "",
    colorCode: "",
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (color) {
      setFormData({
        colorName: color.colorName || "",
        colorCode: color.colorCode || "",
        status: color.status !== undefined ? color.status : true,
      });
    } else {
      setFormData({ colorName: "", colorCode: "", status: true });
    }
    setErrors({});
  }, [color]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.colorName.trim()) newErrors.colorName = "Tên màu là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...formData, colorName: formData.colorName.trim() };
      if (isEditing && color) {
        await colorAPI.update(color.colorId, payload);
        alert("Cập nhật thành công");
      } else {
        await colorAPI.create(payload);
        alert("Thêm thành công");
      }
      onSave();
    } catch (err) {
      console.error("Error saving color:", err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-container">
        <div className="brand-form-header">
          <h2 className="form-title">
            {isEditing ? "Chỉnh sửa màu" : "Thêm màu mới"}
          </h2>
          <button onClick={onCancel} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Tên màu <span className="required">*</span>
              </label>
              <input
                type="text"
                name="colorName"
                value={formData.colorName}
                onChange={handleChange}
                className={`form-input ${errors.colorName ? "error" : ""}`}
              />
              {errors.colorName && (
                <span className="error-message">{errors.colorName}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Mã màu</label>
              <input
                type="text"
                name="colorCode"
                value={formData.colorCode}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                />
                <span className="checkbox-text">Kích hoạt</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ColorForm;
