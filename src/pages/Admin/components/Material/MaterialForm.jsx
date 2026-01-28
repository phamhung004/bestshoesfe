import React, { useState, useEffect } from "react";
import { materialAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandForm.css";

const MaterialForm = ({ material, onSave, onCancel, isEditing = false }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    materialCode: "",
    materialName: "",
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (material) {
      setFormData({
        materialCode: material.materialCode || "",
        materialName: material.materialName || "",
        status: material.status !== undefined ? material.status : true,
      });
    } else {
      setFormData({ materialCode: "", materialName: "", status: true });
    }
    setErrors({});
  }, [material]);

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
    if (!isEditing && !formData.materialCode.trim())
      newErrors.materialCode = "Mã chất liệu là bắt buộc";
    if (!formData.materialName.trim())
      newErrors.materialName = "Tên chất liệu là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        materialName: formData.materialName.trim(),
      };
      // Khi tạo mới, thêm materialCode
      if (!isEditing) {
        payload.materialCode = formData.materialCode.trim();
      }
      if (isEditing && material) {
        await materialAPI.update(material.materialId, payload);
        showToast("Cập nhật chất liệu thành công", "success");
      } else {
        await materialAPI.create(payload);
        showToast("Thêm chất liệu thành công", "success");
      }
      onSave();
    } catch (err) {
      console.error("Error saving material:", err);
      showToast(err.message || "Không thể lưu chất liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-container">
        <div className="brand-form-header">
          <h2 className="form-title">
            {isEditing ? "✏️ Chỉnh sửa chất liệu" : "➕ Thêm chất liệu mới"}
          </h2>
          <button onClick={onCancel} className="btn-close" title="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Mã chất liệu {!isEditing && <span className="required">*</span>}
              </label>
              <input
                type="text"
                name="materialCode"
                value={formData.materialCode}
                onChange={handleChange}
                disabled={isEditing}
                className="form-input"
              />
              {isEditing && (
                <span className="info-text">
                  📌 Không thể thay đổi mã chất liệu
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Tên chất liệu <span className="required">*</span>
              </label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                className={`form-input ${errors.materialName ? "error" : ""}`}
              />
              {errors.materialName && (
                <span className="error-message">{errors.materialName}</span>
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

export default MaterialForm;
