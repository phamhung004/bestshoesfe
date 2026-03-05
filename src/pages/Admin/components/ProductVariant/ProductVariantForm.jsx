import React, { useState, useEffect } from "react";
import {
  productVariantAPI,
  productAPI,
  sizeAPI,
  colorAPI,
} from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandForm.css";

const ProductVariantForm = ({ variant, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    productId: "",
    sizeId: "",
    colorId: "",
    price: "",
    costPrice: "",
    weight: "",
    status: true,
    images: [],
  });
  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageInputs, setImageInputs] = useState([
    { imageUrl: "", altText: "", sortOrder: 0, isPrimary: true },
  ]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [productsRes, sizesRes, colorsRes] = await Promise.all([
          productAPI.getAll(undefined, 0, 5),
          sizeAPI.getAll(undefined, 0, 5),
          colorAPI.getAll(undefined, 0, 5),
        ]);

        setProducts(productsRes?.data?.content || []);
        setSizes(sizesRes?.data?.content || []);
        setColors(colorsRes?.data?.content || []);

        if (variant) {
          setFormData({
            productId: variant.product?.productId || "",
            sizeId: variant.size?.sizeId || "",
            colorId: variant.color?.colorId || "",
            price: variant.price || "",
            costPrice: variant.costPrice || "",
            weight: variant.weight || "",
            status: variant.status ?? true,
            images: variant.images || [],
          });

          if (variant.images && variant.images.length > 0) {
            setImageInputs(
              variant.images.map((img) => ({
                imageUrl: img.imageUrl || "",
                altText: img.altText || "",
                sortOrder: img.sortOrder ?? 0,
                isPrimary: img.isPrimary ?? false,
              })),
            );
          }
        }
        setLoading(false);
      } catch (err) {
        showToast("Không thể tải dữ liệu", "error");
        setLoading(false);
      }
    };

    loadOptions();
  }, [variant, showToast]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseFloat(value) || ""
            : value,
    }));
  };

  const handleImageChange = (index, field, value) => {
    const newImageInputs = [...imageInputs];
    if (field === "sortOrder") {
      newImageInputs[index][field] = parseInt(value) || 0;
    } else if (field === "isPrimary") {
      // Set only one image as primary
      newImageInputs.forEach((img, i) => {
        img.isPrimary = i === index;
      });
    } else {
      newImageInputs[index][field] = value;
    }
    setImageInputs(newImageInputs);
  };

  const addImageInput = () => {
    setImageInputs([
      ...imageInputs,
      {
        imageUrl: "",
        altText: "",
        sortOrder: imageInputs.length,
        isPrimary: false,
      },
    ]);
  };

  const removeImageInput = (index) => {
    setImageInputs(imageInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productId || !formData.sizeId || !formData.colorId) {
      showToast("Vui lòng chọn sản phẩm, size và màu", "warning");
      return;
    }

    if (!formData.price || formData.price <= 0) {
      showToast("Giá phải lớn hơn 0", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        productId: parseInt(formData.productId),
        sizeId: parseInt(formData.sizeId),
        colorId: parseInt(formData.colorId),
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || 0,
        weight: parseFloat(formData.weight) || 0,
        status: formData.status,
        images: imageInputs.filter((img) => img.imageUrl.trim()),
      };

      if (variant) {
        await productVariantAPI.update(variant.variantId, payload);
        showToast("Cập nhật biến thể thành công", "success");
      } else {
        await productVariantAPI.create(payload);
        showToast("Tạo biến thể thành công", "success");
      }

      onSuccess && onSuccess();
    } catch (err) {
      console.error("Error:", err);
      showToast(err.response?.data?.message || "Có lỗi xảy ra", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="form-loading">Đang tải...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="brand-form">
      <h2 className="form-title">
        {variant ? "Cập nhật biến thể" : "Tạo biến thể mới"}
      </h2>

      <div className="form-group">
        <label htmlFor="productId">Sản phẩm *</label>
        <select
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={handleInputChange}
          required
          className="form-input"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sizeId">Size *</label>
          <select
            id="sizeId"
            name="sizeId"
            value={formData.sizeId}
            onChange={handleInputChange}
            required
            className="form-input"
          >
            <option value="">-- Chọn size --</option>
            {sizes.map((s) => (
              <option key={s.sizeId} value={s.sizeId}>
                {s.sizeName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="colorId">Màu *</label>
          <select
            id="colorId"
            name="colorId"
            value={formData.colorId}
            onChange={handleInputChange}
            required
            className="form-input"
          >
            <option value="">-- Chọn màu --</option>
            {colors.map((c) => (
              <option key={c.colorId} value={c.colorId}>
                {c.colorName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Giá bán (₫) *</label>
          <input
            id="price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Nhập giá bán"
            required
            min="0"
            step="1"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="costPrice">Giá vốn (₫)</label>
          <input
            id="costPrice"
            type="number"
            name="costPrice"
            value={formData.costPrice}
            onChange={handleInputChange}
            placeholder="Nhập giá vốn"
            min="0"
            step="1"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="weight">Trọng lượng (kg)</label>
        <input
          id="weight"
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleInputChange}
          placeholder="Nhập trọng lượng"
          min="0"
          step="0.01"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Trạng thái</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value === "true",
            }))
          }
          className="form-input"
        >
          <option value="true">Hoạt động</option>
          <option value="false">Không hoạt động</option>
        </select>
      </div>

      <div className="images-section">
        <h3>Hình ảnh</h3>
        {imageInputs.map((img, index) => (
          <div key={index} className="image-input-group">
            <input
              type="url"
              value={img.imageUrl}
              onChange={(e) =>
                handleImageChange(index, "imageUrl", e.target.value)
              }
              placeholder="URL hình ảnh"
              className="form-input"
            />
            <input
              type="text"
              value={img.altText}
              onChange={(e) =>
                handleImageChange(index, "altText", e.target.value)
              }
              placeholder="Alt Text"
              className="form-input"
            />
            <input
              type="number"
              value={img.sortOrder}
              onChange={(e) =>
                handleImageChange(index, "sortOrder", e.target.value)
              }
              placeholder="Thứ tự"
              min="0"
              className="form-input"
              style={{ maxWidth: "80px" }}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={img.isPrimary}
                onChange={(e) =>
                  handleImageChange(index, "isPrimary", e.target.checked)
                }
              />
              Ảnh chính
            </label>
            {imageInputs.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageInput(index)}
                className="btn-danger"
              >
                Xóa
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addImageInput} className="btn-secondary">
          Thêm ảnh
        </button>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Đang xử lý..." : variant ? "Cập nhật" : "Tạo mới"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Hủy
        </button>
      </div>
    </form>
  );
};

export default ProductVariantForm;
