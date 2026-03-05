import React, { useState, useEffect } from "react";
import {
  productAPI,
  productVariantAPI,
  brandAPI,
  categoryAPI,
  materialAPI,
  colorAPI,
  sizeAPI,
} from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandForm.css";

const ProductForm = ({ product, onSave, onCancel, isEditing = false }) => {
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

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Lists for dropdowns
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  // Generated variants grouped by color
  const [variants, setVariants] = useState([]);
  const [variantImages, setVariantImages] = useState({});

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  // Load product data if editing
  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        brandId: product.brandId || "",
        categoryId: product.categoryId || "",
        materialId: product.materialId || "",
        basePrice: product.basePrice || "",
        status: product.status !== undefined ? product.status : true,
      });
    }
    setErrors({});
  }, [product, isEditing]);

  const loadDropdownData = async () => {
    try {
      const [brandsRes, categoriesRes, materialsRes, colorsRes, sizesRes] =
        await Promise.all([
          brandAPI.getAll(undefined, 0, 100),
          categoryAPI.getAll(undefined, 0, 100),
          materialAPI.getAll(undefined, 0, 100),
          colorAPI.getAll(undefined, 0, 100),
          sizeAPI.getAll(undefined, 0, 100),
        ]);

      setBrands(brandsRes?.data?.content || []);
      setCategories(categoriesRes?.data?.content || []);
      setMaterials(materialsRes?.data?.content || []);
      setColors(colorsRes?.data?.content || []);
      setSizes(sizesRes?.data?.content || []);
    } catch (err) {
      console.error("Error loading dropdown data:", err);
      showToast("Lỗi tải dữ liệu", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleColorToggle = (colorId) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((c) => c !== colorId)
        : [...prev, colorId],
    );
  };

  const handleSizeToggle = (sizeId) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId)
        ? prev.filter((s) => s !== sizeId)
        : [...prev, sizeId],
    );
  };

  const generateVariants = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      showToast("Vui lòng chọn ít nhất một màu và một kích cỡ", "error");
      return;
    }

    const generated = [];
    selectedColors.forEach((colorId) => {
      selectedSizes.forEach((sizeId) => {
        generated.push({
          id: `${colorId}-${sizeId}`,
          colorId,
          sizeId,
          price: formData.basePrice || 0,
          stock: 0,
          sku: `SP-${colorId}-${sizeId}`.toUpperCase(),
        });
      });
    });

    setVariants(generated);
    showToast(`Tạo ${generated.length} biến thể thành công`, "success");
  };

  const updateVariantPrice = (variantId, price) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, price: parseFloat(price) || 0 } : v,
      ),
    );
  };

  const updateVariantStock = (variantId, stock) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, stock: parseInt(stock) || 0 } : v,
      ),
    );
  };

  const handleVariantImageChange = (variantId, files) => {
    if (files && files.length > 0) {
      setVariantImages((prev) => ({
        ...prev,
        [variantId]: Array.from(files),
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.brandId) newErrors.brandId = "Thương hiệu là bắt buộc";
    if (!formData.categoryId) newErrors.categoryId = "Danh mục là bắt buộc";
    if (!formData.materialId) newErrors.materialId = "Chất liệu là bắt buộc";
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0)
      newErrors.basePrice = "Giá phải lớn hơn 0";
    if (!isEditing && variants.length === 0)
      newErrors.variants = "Vui lòng tạo ít nhất một biến thể sản phẩm";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const productPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        brandId: parseInt(formData.brandId),
        categoryId: parseInt(formData.categoryId),
        materialId: parseInt(formData.materialId),
        basePrice: parseFloat(formData.basePrice),
        status: formData.status,
      };

      let createdProductId = product?.productId;

      if (isEditing && product) {
        await productAPI.update(product.productId, productPayload);
        showToast("Cập nhật sản phẩm thành công", "success");
      } else {
        const productRes = await productAPI.create(productPayload);
        createdProductId = productRes?.data?.productId;

        // Create variants for new product
        if (variants.length > 0) {
          for (const variant of variants) {
            const variantPayload = {
              productId: createdProductId,
              colorId: variant.colorId,
              sizeId: variant.sizeId,
              price: variant.price,
              stock: variant.stock,
              sku: variant.sku,
              status: true,
            };

            const variantRes = await productVariantAPI.create(variantPayload);
            const variantId = variantRes?.data?.variantId;

            // Upload images for variant
            if (variantImages[variant.id] && variantId) {
              const formDataImg = new FormData();
              variantImages[variant.id].forEach((file) => {
                formDataImg.append("files", file);
              });

              try {
                await fetch(
                  `http://localhost:8080/api/product-images/variant/${variantId}`,
                  {
                    method: "POST",
                    body: formDataImg,
                  },
                );
              } catch (imgErr) {
                console.error("Error uploading images:", imgErr);
              }
            }
          }
        }

        showToast("Thêm sản phẩm thành công", "success");
      }

      onSave?.();
    } catch (err) {
      console.error("Error saving product:", err);
      showToast(err.message || "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  // Group variants by color
  const variantsByColor = selectedColors.map((colorId) => {
    const color = colors.find((c) => c.colorId === colorId);
    const colorVariants = variants.filter((v) => v.colorId === colorId);
    return {
      colorId,
      colorName: color?.colorName || "Unknown",
      colorCode: color?.colorCode || "#ccc",
      variants: colorVariants,
    };
  });

  return (
    <div className="brand-form-overlay">
      <div
        className="brand-form-container"
        style={{ maxWidth: "1200px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="brand-form-header">
          <h2 className="form-title">
            {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <button onClick={onCancel} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form">
          {/* Thông tin sản phẩm */}
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
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">*Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? "error" : ""}`}
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">*Thương hiệu</label>
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className={`form-input ${errors.brandId ? "error" : ""}`}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.brandId} value={brand.brandId}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brandId && (
                  <span className="error-message">{errors.brandId}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">*Chất liệu</label>
                <select
                  name="materialId"
                  value={formData.materialId}
                  onChange={handleChange}
                  className={`form-input ${errors.materialId ? "error" : ""}`}
                >
                  <option value="">Chọn chất liệu</option>
                  {materials.map((material) => (
                    <option
                      key={material.materialId}
                      value={material.materialId}
                    >
                      {material.name}
                    </option>
                  ))}
                </select>
                {errors.materialId && (
                  <span className="error-message">{errors.materialId}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">*Điều cần bằng</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`form-input ${errors.categoryId ? "error" : ""}`}
                >
                  <option value="">Chọn độ cứng</option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="error-message">{errors.categoryId}</span>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="status"
                    className="form-checkbox"
                    checked={formData.status}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Trạng thái</span>
                </label>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">*Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="Nhập mô tả sản phẩm"
              />
            </div>
          </section>

          {!isEditing && (
            <>
              {/* Chọn Màu sắc & Trọng lượng */}
              <section style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    marginBottom: "16px",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}
                >
                  Màu sắc & Trọng lượng
                </h3>

                {/* Chọn Trọng lượng */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#4b5563",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    *Trọng lượng:
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {sizes.map((size) => (
                      <label
                        key={size.sizeId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          border: selectedSizes.includes(size.sizeId)
                            ? "2px solid #3b82f6"
                            : "1px solid #d1d5db",
                          borderRadius: "6px",
                          cursor: "pointer",
                          backgroundColor: selectedSizes.includes(size.sizeId)
                            ? "#eff6ff"
                            : "white",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size.sizeId)}
                          onChange={() => handleSizeToggle(size.sizeId)}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: "500" }}>
                          {size.sizeName}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSizes.length < sizes.length) {
                        setSelectedSizes(sizes.map((s) => s.sizeId));
                      } else {
                        setSelectedSizes([]);
                      }
                    }}
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#3b82f6",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {selectedSizes.length < sizes.length
                      ? "Chọn tất cả"
                      : "Bỏ chọn"}
                  </button>
                </div>

                {/* Chọn Màu sắc */}
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#4b5563",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    *Màu sắc:
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {colors.map((color) => (
                      <label
                        key={color.colorId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          border: selectedColors.includes(color.colorId)
                            ? "2px solid #3b82f6"
                            : "1px solid #d1d5db",
                          borderRadius: "6px",
                          cursor: "pointer",
                          backgroundColor: selectedColors.includes(
                            color.colorId,
                          )
                            ? "#eff6ff"
                            : "white",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color.colorId)}
                          onChange={() => handleColorToggle(color.colorId)}
                          style={{ cursor: "pointer" }}
                        />
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: color.colorCode || "#ccc",
                            borderRadius: "3px",
                            border: "1px solid #999",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: "13px" }}>
                          {color.colorName}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedColors.length < colors.length) {
                        setSelectedColors(colors.map((c) => c.colorId));
                      } else {
                        setSelectedColors([]);
                      }
                    }}
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#3b82f6",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {selectedColors.length < colors.length
                      ? "Chọn màu sắc"
                      : "Bỏ chọn"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={generateVariants}
                  disabled={
                    selectedColors.length === 0 || selectedSizes.length === 0
                  }
                  style={{
                    marginTop: "16px",
                    padding: "10px 16px",
                    backgroundColor:
                      selectedColors.length === 0 || selectedSizes.length === 0
                        ? "#d1d5db"
                        : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      selectedColors.length === 0 || selectedSizes.length === 0
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  ➕ Tạo biến thể sản phẩm
                </button>
              </section>

              {/* Danh sách biến thể theo màu */}
              {variants.length > 0 && (
                <section style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      marginBottom: "16px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1f2937",
                    }}
                  >
                    Quản lý biến thể sản phẩm
                  </h3>

                  {variantsByColor.map((group) => (
                    <div
                      key={group.colorId}
                      style={{
                        marginBottom: "24px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "16px",
                          padding: "12px",
                          backgroundColor: "#ffffff",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: group.colorCode,
                            borderRadius: "4px",
                            border: "2px solid #d1d5db",
                          }}
                        />
                        <div>
                          <h4
                            style={{
                              margin: "0",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1f2937",
                            }}
                          >
                            {group.colorName}
                          </h4>
                          <p
                            style={{
                              margin: "0",
                              fontSize: "12px",
                              color: "#6b7280",
                            }}
                          >
                            {group.variants.length} biến thể • 0 sản phẩm • Giá
                            TB: 0 đ
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {group.variants.map((v) => {
                          const size = sizes.find((s) => s.sizeId === v.sizeId);
                          return (
                            <div
                              key={v.id}
                              style={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "12px",
                              }}
                            >
                              <h5
                                style={{
                                  margin: "0 0 12px 0",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                {group.colorName} - {size?.sizeName}
                              </h5>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  marginBottom: "12px",
                                }}
                              >
                                Trọng lượng: {size?.sizeName}
                              </div>

                              <div style={{ marginBottom: "12px" }}>
                                <label
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#4b5563",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  # Số lượng
                                </label>
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) =>
                                    updateVariantStock(v.id, e.target.value)
                                  }
                                  min="0"
                                  style={{
                                    padding: "6px 8px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    width: "100%",
                                  }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#4b5563",
                                    display: "block",
                                    marginBottom: "4px",
                                  }}
                                >
                                  $ Đơn giá (VND)
                                </label>
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) =>
                                    updateVariantPrice(v.id, e.target.value)
                                  }
                                  min="0"
                                  step="1000"
                                  style={{
                                    padding: "6px 8px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    width: "100%",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {errors.variants && (
                <div
                  style={{
                    marginBottom: "16px",
                    color: "#dc2626",
                    fontSize: "13px",
                  }}
                >
                  {errors.variants}
                </div>
              )}
            </>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
