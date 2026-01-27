import React, { useState, useEffect } from "react";
import { brandAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "./BrandForm.css";

const BrandForm = ({ brand, onSave, onCancel, isEditing = false }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    website: "",
    originCountry: "",
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        logo: brand.logo || "",
        website: brand.website || "",
        originCountry: brand.originCountry || "",
        status: brand.status !== undefined ? brand.status : true,
      });
    } else {
      // Reset form for new brand
      setFormData({
        name: "",
        slug: "",
        description: "",
        logo: "",
        website: "",
        originCountry: "",
        status: true,
      });
    }
    setErrors({});
    setSlugEdited(false);
  }, [brand]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (name === "status") {
      newValue = value === "true";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Auto-generate slug from name if not manually edited
    if (name === "name" && !slugEdited) {
      const generatedSlug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  };

  const handleSlugChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      slug: value,
    }));
    setSlugEdited(true);

    // Clear error for slug field
    if (errors.slug) {
      setErrors((prev) => ({
        ...prev,
        slug: null,
      }));
    }
  };

  const generateSlug = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên thương hiệu là bắt buộc";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug là bắt buộc";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug chỉ được chứa chữ cái, số và dấu gạch ngang";
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        "Website phải là URL hợp lệ (bắt đầu bằng http:// hoặc https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const brandData = {
        ...formData,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        logo: formData.logo.trim(),
        website: formData.website.trim(),
        originCountry: formData.originCountry.trim(),
      };

      if (isEditing && brand) {
        await brandAPI.update(brand.brandId, brandData);
        showToast("Cập nhật thương hiệu thành công", "success");
      } else {
        await brandAPI.create(brandData);
        showToast("Thêm thương hiệu thành công", "success");
      }

      onSave();
    } catch (error) {
      console.error("Error saving brand:", error);
      if (error.message.includes("Slug already exists")) {
        setErrors({ slug: "Slug đã tồn tại. Vui lòng chọn slug khác." });
        showToast("Slug đã tồn tại", "error");
      } else {
        showToast(error.message || "Không thể lưu thương hiệu", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-container">
        <div className="brand-form-header">
          <h2 className="form-title">
            {isEditing ? "✏️ Chỉnh sửa thương hiệu" : "➕ Thêm thương hiệu mới"}
          </h2>
          <button onClick={onCancel} className="btn-close" title="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Tên thương hiệu <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Nhập tên thương hiệu"
                autoFocus
              />
              {errors.name && (
                <span className="error-message">⚠️ {errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="slug" className="form-label">
                Slug <span className="required">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleSlugChange}
                className={`form-input ${errors.slug ? "error" : ""}`}
                placeholder="slug-url-friendly"
              />
              {errors.slug && (
                <span className="error-message">⚠️ {errors.slug}</span>
              )}
              <small className="form-hint">
                💡 Slug sẽ được sử dụng trong URL. Chỉ chứa chữ cái, số và dấu
                gạch ngang.
              </small>
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
                placeholder="Mô tả về thương hiệu..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="logo" className="form-label">
                Logo URL
              </label>
              <input
                type="url"
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                className="form-input"
                placeholder="https://example.com/logo.png"
              />
              {formData.logo && (
                <div className="logo-preview">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="preview-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <span className="preview-error">Không thể tải ảnh</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="website" className="form-label">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={`form-input ${errors.website ? "error" : ""}`}
                placeholder="https://www.example.com"
              />
              {errors.website && (
                <span className="error-message">⚠️ {errors.website}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="originCountry" className="form-label">
                Quốc gia xuất xứ
              </label>
              <input
                type="text"
                id="originCountry"
                name="originCountry"
                value={formData.originCountry}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ví dụ: Việt Nam, USA, Nhật Bản"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status.toString()}
                onChange={handleInputChange}
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

export default BrandForm;
