import React, { useState, useEffect, useMemo } from "react";
import { productVariantAPI, colorAPI, sizeAPI } from "../../../../services/api";
import {
  uploadLocalFileToCloud,
  validateImageFile,
  imageUploadConstraints,
} from "../../../../services/cloudUpload";
import "../Brand/BrandForm.css";

const ProductVariantForm = ({ variant, productName, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: "",
    price: "",
    stock: "",
    description: "",
    status: true,
  });

  const [colorName, setColorName] = useState("");
  const [sizeName, setSizeName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewItems, setPreviewItems] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingPrimaryImage, setExistingPrimaryImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [errors, setErrors] = useState({});

  const canSubmit = useMemo(() => !loading && !loadingImages, [loading, loadingImages]);

  useEffect(() => {
    if (!variant) return;

    setFormData({
      sku: variant.sku || "",
      price: variant.price || "",
      stock: variant.stock || "",
      description: variant.description || "",
      status: variant.status !== undefined ? variant.status : true,
    });

    if (variant.colorId) {
      colorAPI
        .getById(variant.colorId)
        .then((res) => {
          setColorName(res?.data?.colorName || res?.colorName || "");
        })
        .catch(() => {});
    }

    if (variant.sizeId) {
      sizeAPI
        .getById(variant.sizeId)
        .then((res) => {
          setSizeName(res?.data?.sizeName || res?.sizeName || "");
        })
        .catch(() => {});
    }
  }, [variant]);

  useEffect(() => {
    if (!variant?.variantId) return;
    loadVariantImages(variant.variantId);
  }, [variant?.variantId]);

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [previewItems]);

  const loadVariantImages = async (variantId) => {
    try {
      setLoadingImages(true);
      const response = await productVariantAPI.getImages(variantId);
      const data = response?.data || response || {};
      const images = data?.images || [];
      setExistingImages(images);
      setExistingPrimaryImage(data?.primaryImage || images.find((img) => img.isPrimary) || null);
    } catch (err) {
      console.error("Error loading variant images:", err);
      setExistingImages([]);
      setExistingPrimaryImage(null);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setSelectedFiles([]);
      setPreviewItems([]);
      return;
    }

    const fileErrors = [];
    const validFiles = [];

    files.forEach((file) => {
      const message = validateImageFile(file);
      if (message) {
        fileErrors.push(`${file.name}: ${message}`);
      } else {
        validFiles.push(file);
      }
    });

    if (fileErrors.length > 0) {
      setErrors((prev) => ({
        ...prev,
        images: fileErrors.join(" | "),
      }));
    } else {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    setSelectedFiles(validFiles);

    const items = validFiles.map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      sortOrder: index + 1,
      isPrimary: index === 0,
      altText: `Variant ${variant?.variantId} image ${index + 1}`,
    }));
    setPreviewItems(items);
  };

  const setPrimaryPreview = (index) => {
    setPreviewItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === index,
      })),
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.sku.trim()) newErrors.sku = "SKU là bắt buộc";
    if (!formData.price || parseFloat(formData.price) < 0) newErrors.price = "Giá không hợp lệ";
    if (!formData.stock || parseInt(formData.stock, 10) < 0) newErrors.stock = "Số lượng không hợp lệ";

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const uploadAndSaveImages = async () => {
    if (!variant?.variantId || previewItems.length === 0) return;

    const uploadedUrls = [];
    for (const item of previewItems) {
      const url = await uploadLocalFileToCloud(item.file);
      uploadedUrls.push({ ...item, url });
    }

    const primaryIndex = uploadedUrls.findIndex((img) => img.isPrimary);

    const payload = uploadedUrls.map((item, index) => ({
      imageUrl: item.url,
      altText: item.altText || `Variant ${variant.variantId} image ${index + 1}`,
      sortOrder: item.sortOrder || index + 1,
      isPrimary: primaryIndex >= 0 ? index === primaryIndex : index === 0,
    }));

    const saveResponse = await productVariantAPI.saveImages(variant.variantId, payload);
    const saveData = saveResponse?.data || saveResponse || {};

    if (saveData?.images) {
      setExistingImages(saveData.images);
      setExistingPrimaryImage(saveData?.primaryImage || saveData.images.find((img) => img.isPrimary) || null);
    } else {
      await loadVariantImages(variant.variantId);
    }

    setSelectedFiles([]);
    setPreviewItems([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        sku: formData.sku.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        description: formData.description.trim(),
        status: formData.status,
      };

      await productVariantAPI.update(variant.variantId, payload);

      if (selectedFiles.length > 0) {
        await uploadAndSaveImages();
      }

      alert("Cập nhật biến thể thành công");
      onSave?.();
    } catch (err) {
      console.error("Error saving variant:", err);
      const message = err?.response?.data?.message || err?.message || "Lỗi cập nhật biến thể";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-container" style={{ maxWidth: "980px" }}>
        <div className="brand-form-header">
          <h2 className="form-title">Chỉnh sửa biến thể sản phẩm</h2>
          <button onClick={onCancel} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>{productName}</h3>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              Màu: {colorName} | Kích cỡ: {sizeName}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                SKU <span className="required">*</span>
              </label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={`form-input ${errors.sku ? "error" : ""}`} disabled />
              {errors.sku && <span className="error-message">{errors.sku}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Giá (VND) <span className="required">*</span>
              </label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className={`form-input ${errors.price ? "error" : ""}`} min="0" step="1000" />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Số lượng <span className="required">*</span>
              </label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={`form-input ${errors.stock ? "error" : ""}`} min="0" />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                name="status"
                value={formData.status.toString()}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value === "true" }))}
                className="form-input"
              >
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Mô tả</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows="3" />
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "grid", gap: "18px" }}>
            <div>
              <h3 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>Ảnh hiện tại</h3>
              {loadingImages ? (
                <div style={{ fontSize: "13px", color: "#6b7280" }}>Đang tải ảnh...</div>
              ) : existingImages.length === 0 ? (
                <div style={{ fontSize: "13px", color: "#9ca3af" }}>Chưa có ảnh cho biến thể này</div>
              ) : (
                <>
                  {existingPrimaryImage?.imageUrl && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Ảnh chính</div>
                      <img
                        src={existingPrimaryImage.imageUrl}
                        alt={existingPrimaryImage.altText || "primary-image"}
                        style={{ width: "180px", height: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      />
                    </div>
                  )}

                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Gallery</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                    {existingImages.map((img) => (
                      <div key={img.imageId || img.imageUrl} style={{ border: img.isPrimary ? "2px solid #2563eb" : "1px solid #e5e7eb", borderRadius: "8px", padding: "4px" }}>
                        <img src={img.imageUrl} alt={img.altText || "variant-image"} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "6px" }} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <h3 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>Upload ảnh mới</h3>
              <div style={{ marginBottom: "12px", fontSize: "12px", color: "#6b7280" }}>
                Chỉ nhận JPG/PNG/WEBP, tối đa {imageUploadConstraints.maxSizeMb}MB mỗi ảnh
              </div>
              <label
                style={{
                  display: "block",
                  padding: "16px",
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#f9fafb",
                }}
              >
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} style={{ display: "none" }} />
                <div style={{ fontSize: "13px", color: "#6b7280" }}>Chọn nhiều ảnh từ máy tính</div>
              </label>
              {errors.images && <div style={{ marginTop: "8px", color: "#b91c1c", fontSize: "12px" }}>{errors.images}</div>}

              {previewItems.length > 0 && (
                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
                    Preview trước khi upload (chọn ảnh chính):
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                    {previewItems.map((item, idx) => (
                      <div key={`${item.file.name}-${idx}`} style={{ border: item.isPrimary ? "2px solid #2563eb" : "1px solid #e5e7eb", borderRadius: "8px", padding: "6px" }}>
                        <img src={item.previewUrl} alt={`preview-${idx}`} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "6px" }} />
                        <button
                          type="button"
                          onClick={() => setPrimaryPreview(idx)}
                          style={{
                            marginTop: "6px",
                            width: "100%",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 8px",
                            backgroundColor: item.isPrimary ? "#2563eb" : "#e5e7eb",
                            color: item.isPrimary ? "#ffffff" : "#111827",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {item.isPrimary ? "Ảnh chính" : "Đặt làm ảnh chính"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel" disabled={!canSubmit}>
              Hủy
            </button>
            <button type="submit" disabled={!canSubmit} className="btn-submit">
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductVariantForm;
