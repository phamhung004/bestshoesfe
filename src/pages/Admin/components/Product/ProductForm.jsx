import React, { useState, useEffect } from "react";
import {
  productAPI,
  brandAPI,
  categoryAPI,
  materialAPI,
} from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandForm.css";

const ProductForm = ({ product, onSave, onCancel, isEditing }) => {
  const { showToast } = useToast();
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [brandId, setBrandId] = useState(
    product?.brandId || product?.brand?.brandId || "",
  );
  const [categoryId, setCategoryId] = useState(
    product?.categoryId || product?.category?.categoryId || "",
  );
  const [materialId, setMaterialId] = useState(
    product?.materialId || product?.material?.materialId || "",
  );
  const [status, setStatus] = useState(product?.status ?? true);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [b, c, m] = await Promise.all([
          brandAPI.getAll(0, 1000),
          categoryAPI.getAll(0, 1000),
          materialAPI.getAll(0, 1000),
        ]);
        // Extract content from paginated response
        const brandsList = b?.data?.content || b?.content || b || [];
        const categoriesList = c?.data?.content || c?.content || c || [];
        const materialsList = m?.data?.content || m?.content || m || [];

        setBrands(Array.isArray(brandsList) ? brandsList : []);
        setCategories(Array.isArray(categoriesList) ? categoriesList : []);
        setMaterials(Array.isArray(materialsList) ? materialsList : []);
      } catch (err) {
        console.error("Lookup fetch failed", err);
        setBrands([]);
        setCategories([]);
        setMaterials([]);
      }
    };
    fetchLookups();
  }, []);

  // sync form fields when product prop changes (important for newly created products that may not include nested objects)
  useEffect(() => {
    setName(product?.name || "");
    setDescription(product?.description || "");
    setBrandId(product?.brandId || product?.brand?.brandId || "");
    setCategoryId(product?.categoryId || product?.category?.categoryId || "");
    setMaterialId(product?.materialId || product?.material?.materialId || "");
    setStatus(product?.status ?? true);
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", "error");
      return;
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      brandId: brandId ? parseInt(brandId) : null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      materialId: materialId ? parseInt(materialId) : null,
      status,
    };

    try {
      if (isEditing && product && (product.productId || product.id)) {
        await productAPI.update(product.productId || product.id, payload);
        showToast("Cập nhật sản phẩm thành công", "success");
      } else {
        await productAPI.create(payload);
        showToast("Thêm sản phẩm thành công", "success");
      }
      if (onSave) onSave();
    } catch (err) {
      console.error("Save failed", err);
      showToast(err.message || "Không thể lưu sản phẩm", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="brand-form-overlay" role="dialog" aria-modal="true">
      <div className="brand-form-container" role="document">
        <div className="brand-form-header">
          <h2 className="form-title">
            {isEditing ? "✏️ Chỉnh sửa sản phẩm" : "➕ Thêm sản phẩm mới"}
          </h2>
          <button
            type="button"
            className="btn-close"
            aria-label="Đóng"
            onClick={onCancel}
            title="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="brand-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Tên sản phẩm <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên sản phẩm"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thương hiệu</label>
                <select
                  className="form-input"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((b) => (
                    <option key={b.brandId || b.id} value={b.brandId || b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select
                  className="form-input"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option
                      key={c.categoryId || c.id}
                      value={c.categoryId || c.id}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chất liệu</label>
                <select
                  className="form-input"
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                >
                  <option value="">-- Chọn chất liệu --</option>
                  {materials.map((m) => (
                    <option
                      key={m.materialId || m.id}
                      value={m.materialId || m.id}
                    >
                      {m.materialName || m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-input"
                  value={status.toString()}
                  onChange={(e) => setStatus(e.target.value === "true")}
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel}>
                Hủy bỏ
              </button>
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving
                  ? "⏳ Đang lưu..."
                  : isEditing
                    ? "✏️ Cập nhật"
                    : "✅ Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
