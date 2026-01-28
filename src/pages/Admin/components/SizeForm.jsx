import React, { useState, useEffect } from "react";
import { sizeAPI } from "../../../services/api";
import "./Brand/BrandForm.css";

const SizeForm = ({ size, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({ sizeName: "", status: true });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (size) {
      setFormData({
        sizeName: size.sizeName || "",
        status: size.status !== undefined ? size.status : true,
      });
    } else {
      setFormData({ sizeName: "", status: true });
    }
    setErrors({});
  }, [size]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.sizeName.trim())
      newErrors.sizeName = "Tên kích cỡ là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...formData, sizeName: formData.sizeName.trim() };
      if (isEditing && size) {
        await sizeAPI.update(size.sizeId, payload);
        alert("Cập nhật thành công");
      } else {
        await sizeAPI.create(payload);
        alert("Thêm thành công");
      }
      onSave();
    } catch (err) {
      console.error("Error saving size:", err);
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
            {isEditing ? "Chỉnh sửa kích cỡ" : "Thêm kích cỡ mới"}
          </h2>
          <button onClick={onCancel} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Tên kích cỡ <span className="required">*</span>
              </label>
              <input
                type="text"
                name="sizeName"
                value={formData.sizeName}
                onChange={handleChange}
                className={`form-input ${errors.sizeName ? "error" : ""}`}
              />
              {errors.sizeName && (
                <span className="error-message">{errors.sizeName}</span>
              )}
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

export default SizeForm;
