import React, { useState, useEffect } from 'react';
import { productAPI, brandAPI, categoryAPI, materialAPI } from '../../../services/api';
import './BrandForm.css';

const ProductForm = ({ product, onSave, onCancel, isEditing }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [brandId, setBrandId] = useState(product?.brandId || product?.brand?.brandId || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || product?.category?.categoryId || '');
  const [materialId, setMaterialId] = useState(product?.materialId || product?.material?.materialId || '');
  const [status, setStatus] = useState(product?.status ?? true);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [b, c, m] = await Promise.all([brandAPI.getAll(), categoryAPI.getAll(), materialAPI.getAll()]);
        setBrands(b || []);
        setCategories(c || []);
        setMaterials(m || []);
      } catch (err) {
        console.error('Lookup fetch failed', err);
      }
    };
    fetchLookups();
  }, []);

  // sync form fields when product prop changes (important for newly created products that may not include nested objects)
  useEffect(() => {
    setName(product?.name || '');
    setDescription(product?.description || '');
    setBrandId(product?.brandId || product?.brand?.brandId || '');
    setCategoryId(product?.categoryId || product?.category?.categoryId || '');
    setMaterialId(product?.materialId || product?.material?.materialId || '');
    setStatus(product?.status ?? true);
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      description,
      brandId: brandId || null,
      categoryId: categoryId || null,
      materialId: materialId || null,
      status,
    };

    try {
      if (isEditing && product && (product.productId || product.id)) {
        await productAPI.update(product.productId || product.id, payload);
      } else {
        await productAPI.create(payload);
      }
      if (onSave) onSave();
    } catch (err) {
      console.error('Save failed', err);
      alert('Lưu sản phẩm thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" role="document">
        <div className="modal-header">
          <h3>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <button type="button" className="btn-close" aria-label="Đóng" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Tên sản phẩm</label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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
                    <option key={b.brandId || b.id} value={b.brandId || b.id}>{b.name}</option>
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
                    <option key={c.categoryId || c.id} value={c.categoryId || c.id}>{c.name}</option>
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
                    <option key={m.materialId || m.id} value={m.materialId || m.id}>{m.materialName || m.name}</option>
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
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      className="form-checkbox"
                      type="checkbox"
                      checked={!!status}
                      onChange={(e) => setStatus(e.target.checked)}
                    />
                    <span className="checkbox-text">Hoạt động</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onCancel}>Hủy</button>
              <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;


