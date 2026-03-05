import React, { useState, useEffect } from "react";
import { sizeAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandForm.css";

const SizeForm = ({ size, onSave, onCancel, isEditing = false }) => {
  const { showToast } = useToast();
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
    const { name, value, type } = e.target;
    let newValue = value;
    if (name === "status") {
      newValue = value === "true";
    }
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
      const payload = {
        sizeName: formData.sizeName.trim(),
        status: formData.status,
      };
      if (isEditing && size) {
        await sizeAPI.update(size.sizeId, payload);
        showToast("Cập nhật kích cỡ thành công", "success");
      } else {
        await sizeAPI.create(payload);
        showToast("Thêm kích cỡ thành công", "success");
      }
      onSave();
    } catch (err) {
      console.error("Error saving size:", err);
      showToast(err.message || "Không thể lưu kích cỡ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-container">
        <div className="brand-form-header">
          <h2 className="form-title">
            {isEditing ? "✏️ Chỉnh sửa kích cỡ" : "➕ Thêm kích cỡ mới"}
          </h2>
          <button onClick={onCancel} className="btn-close" title="Đóng">
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
                placeholder="Ví dụ: 40, 41, 42, 43"
                className={`form-input ${errors.sizeName ? "error" : ""}`}
              />
              {errors.sizeName && (
                <span className="error-message">{errors.sizeName}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                name="status"
                value={formData.status.toString()}
                onChange={handleChange}
                className="form-input"
              >
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Hủy bỏ
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? "⏳ Đang lưu..."
                : isEditing
                  ? "✏️ Cập nhật"
                  : "✅ Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SizeForm;
