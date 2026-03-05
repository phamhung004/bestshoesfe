import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  productAPI,
  brandAPI,
  categoryAPI,
  materialAPI,
} from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandForm.css";

const ProductEditPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    materialId: "",
    basePrice: "",
    status: true,
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load dropdowns
      const [brandsRes, categoriesRes, materialsRes] = await Promise.all([
        brandAPI.getAll(undefined, 0, 100),
        categoryAPI.getAll(undefined, 0, 100),
        materialAPI.getAll(undefined, 0, 100),
      ]);

      setBrands(brandsRes?.data?.content || []);
      setCategories(categoriesRes?.data?.content || []);
      setMaterials(materialsRes?.data?.content || []);

      // Load product
      const productRes = await productAPI.getById(productId);
      const product = productRes?.data || productRes;

      setFormData({
        name: product.name || "",
        description: product.description || "",
        brandId: product.brandId || "",
        categoryId: product.categoryId || "",
        materialId: product.materialId || "",
        basePrice: product.basePrice || "",
        status: product.status !== undefined ? product.status : true,
      });

      setErrors({});
    } catch (err) {
      console.error("Error loading data:", err);
      showToast("Lỗi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.brandId) newErrors.brandId = "Thương hiệu là bắt buộc";
    if (!formData.categoryId) newErrors.categoryId = "Danh mục là bắt buộc";
    if (!formData.materialId) newErrors.materialId = "Chất liệu là bắt buộc";
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0)
      newErrors.basePrice = "Giá phải lớn hơn 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        brandId: parseInt(formData.brandId),
        categoryId: parseInt(formData.categoryId),
        materialId: parseInt(formData.materialId),
        basePrice: parseFloat(formData.basePrice),
        status: formData.status,
      };

      await productAPI.update(productId, payload);
      showToast("Cập nhật sản phẩm thành công", "success");
      navigate(-1);
    } catch (err) {
      console.error("Error saving product:", err);
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>Đang tải...</div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "16px",
            padding: "8px 12px",
            backgroundColor: "#99FFFF",
            border: "1px solid #67e8f9",
            borderRadius: "8px",
            color: "#0f172a",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          ← Quay lại
        </button>
        <h1
          style={{
            margin: "0",
            fontSize: "28px",
            fontWeight: "700",
            color: "#1f2937",
          }}
        >
          Chỉnh sửa sản phẩm
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <section style={{ marginBottom: "32px" }}>
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            Thông tin sản phẩm
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#4b5563",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                *Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: errors.name
                    ? "1px solid #dc2626"
                    : "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
              {errors.name && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#dc2626",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.name}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#4b5563",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                *Thương hiệu
              </label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: errors.brandId
                    ? "1px solid #dc2626"
                    : "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.brandId} value={brand.brandId}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#dc2626",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.brandId}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#4b5563",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                *Chất liệu
              </label>
              <select
                name="materialId"
                value={formData.materialId}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: errors.materialId
                    ? "1px solid #dc2626"
                    : "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <option value="">Chọn chất liệu</option>
                {materials.map((material) => (
                  <option key={material.materialId} value={material.materialId}>
                    {material.name}
                  </option>
                ))}
              </select>
              {errors.materialId && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#dc2626",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.materialId}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#4b5563",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                *Độ cứng
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: errors.categoryId
                    ? "1px solid #dc2626"
                    : "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <option value="">Chọn độ cứng</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#dc2626",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.categoryId}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#4b5563",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                *Giá cơ bản
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                min="0"
                step="1000"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: errors.basePrice
                    ? "1px solid #dc2626"
                    : "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              />
              {errors.basePrice && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#dc2626",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.basePrice}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#4b5563",
                display: "block",
                marginBottom: "6px",
              }}
            >
              *Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              rows="3"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              id="status"
              style={{ cursor: "pointer" }}
            />
            <label
              htmlFor="status"
              style={{ fontSize: "13px", color: "#4b5563", cursor: "pointer" }}
            >
              Kích hoạt sản phẩm
            </label>
          </div>
        </section>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f3f4f6",
              color: "#1f2937",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Đang lưu..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEditPage;
