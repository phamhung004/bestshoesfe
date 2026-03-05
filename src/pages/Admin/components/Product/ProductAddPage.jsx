import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  productAPI,
  brandAPI,
  categoryAPI,
  materialAPI,
  colorAPI,
  sizeAPI,
} from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import {
  getCloudUploadConfigError,
  uploadLocalFileToCloud,
  validateImageFile,
} from "../../../../services/cloudUpload";
import "../Brand/BrandForm.css";

const ProductAddPage = () => {
  const navigate = useNavigate();
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

  // Generated variants
  const [variants, setVariants] = useState([]);
  const [variantImages, setVariantImages] = useState({});
  const fileInputRefs = useRef({});

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load dropdown data
  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [brandsRes, categoriesRes, materialsRes, colorsRes, sizesRes] =
        await Promise.all([
          brandAPI.getAll(undefined, 0, 10, 1),
          categoryAPI.getAll(undefined, 0, 10, 1),
          materialAPI.getAll(undefined, 0, 10, 1),
          colorAPI.getAll(undefined, 0, 10, 1),
          sizeAPI.getAll(undefined, 0, 10, 1),
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

  const syncVariants = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      setVariants([]);
      return;
    }

    setVariants((prev) => {
      const prevMap = new Map(prev.map((v) => [v.id, v]));
      const generated = [];

      selectedColors.forEach((colorId) => {
        selectedSizes.forEach((sizeId) => {
          const id = `${colorId}-${sizeId}`;
          const existing = prevMap.get(id);
          generated.push({
            id,
            colorId,
            sizeId,
            price:
              existing?.price != null
                ? existing.price
                : parseFloat(formData.basePrice) || 0,
            costPrice:
              existing?.costPrice != null
                ? existing.costPrice
                : parseFloat(formData.basePrice) || 0,
            weight: existing?.weight != null ? existing.weight : 0,
            stock: existing?.stock ?? 0,
            status: existing?.status ?? true,
            sku: existing?.sku || `SP-${colorId}-${sizeId}`.toUpperCase(),
          });
        });
      });

      return generated;
    });
  };


  useEffect(() => {
    syncVariants();
  }, [selectedColors, selectedSizes, formData.basePrice]);

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

  const updateVariantCostPrice = (variantId, costPrice) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, costPrice: parseFloat(costPrice) || 0 }
          : v,
      ),
    );
  };

  const updateVariantWeight = (variantId, weight) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, weight: parseFloat(weight) || 0 } : v,
      ),
    );
  };

  const updateVariantStatus = (variantId, status) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, status } : v)),
    );
  };

  const handleVariantImageChange = (variantId, files) => {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const invalidMessage = selectedFiles
      .map((file) => validateImageFile(file))
      .find(Boolean);

    if (invalidMessage) {
      showToast(invalidMessage, "error");
      return;
    }

    setVariantImages((prev) => {
      const currentFiles = prev[variantId] || [];
      const dedupMap = new Map();

      [...currentFiles, ...selectedFiles].forEach((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!dedupMap.has(key)) {
          dedupMap.set(key, file);
        }
      });

      return {
        ...prev,
        [variantId]: Array.from(dedupMap.values()),
      };
    });

    if (fileInputRefs.current[variantId]) {
      fileInputRefs.current[variantId].value = "";
    }

    if (errors.variantImages) {
      setErrors((prev) => ({ ...prev, variantImages: null }));
    }
  };

  const removeVariantImage = (variantId, imageIndex) => {
    setVariantImages((prev) => ({
      ...prev,
      [variantId]: (prev[variantId] || []).filter((_, idx) => idx !== imageIndex),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.brandId) newErrors.brandId = "Thương hiệu là bắt buộc";
    if (!formData.categoryId) newErrors.categoryId = "Danh mục là bắt buộc";
    if (!formData.materialId) newErrors.materialId = "Chất liệu là bắt buộc";
    if (variants.length === 0) {
      newErrors.variants = "Vui lòng tạo ít nhất một biến thể sản phẩm";
    }

    const invalidPriceVariant = variants.find(
      (variant) => Number(variant.price || 0) <= 0,
    );
    if (invalidPriceVariant) {
      newErrors.variants = "Mỗi biến thể phải có đơn giá lớn hơn 0";
    }

    const invalidCostPriceVariant = variants.find(
      (variant) => Number(variant.costPrice || 0) <= 0,
    );
    if (invalidCostPriceVariant) {
      newErrors.variants = "Mỗi biến thể phải có giá nhập lớn hơn 0";
    }

    const invalidWeightVariant = variants.find(
      (variant) => Number(variant.weight || 0) <= 0,
    );
    if (invalidWeightVariant) {
      newErrors.variants = "Mỗi biến thể phải có cân nặng lớn hơn 0";
    }

    const variantImageError = variants.find((variant) => {
      const images = variantImages[variant.id] || [];
      return images.length === 0;
    });

    if (variantImageError) {
      newErrors.variantImages = "Mỗi biến thể phải có ít nhất 1 ảnh";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast(Object.values(newErrors)[0], "error");
      console.warn("Product create validation failed", newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      console.warn("Create product ignored: submit while loading");
      showToast("Đang xử lý tạo sản phẩm, vui lòng chờ...", "error");
      return;
    }

    if (!validate()) return;

    const cloudConfigError = getCloudUploadConfigError();
    if (cloudConfigError) {
      console.error("Create product blocked: cloud config missing", {
        hasCloudName: Boolean(
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
            import.meta.env.VITE_CLOUD_NAME,
        ),
        hasUploadPreset: Boolean(
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
            import.meta.env.VITE_CLOUDINARY_PRESET ||
            import.meta.env.VITE_UPLOAD_PRESET,
        ),
      });
      showToast(cloudConfigError, "error");
      return;
    }

    setLoading(true);
    try {
      const productVariantsPayload = await Promise.all(
        variants.map(async (variant) => {
          const localFiles = variantImages[variant.id] || [];

          if (localFiles.length === 0) {
            throw new Error("Mỗi biến thể phải có ít nhất 1 ảnh");
          }

          const uploadedUrls = await Promise.all(
            localFiles.map((file) => uploadLocalFileToCloud(file)),
          );

          const images = uploadedUrls.map((url, index) => ({
            imageUrl: url,
            altText: `${formData.name.trim()} - ${variant.sku} - ảnh ${index + 1}`,
            sortOrder: index,
            isPrimary: index === 0,
          }));

          const primaryCount = images.filter((image) => image.isPrimary).length;
          if (primaryCount > 1) {
            throw new Error("Mỗi biến thể chỉ được có 1 ảnh chính");
          }

          return {
            sizeId: Number(variant.sizeId),
            colorId: Number(variant.colorId),
            quantity: Number(variant.stock || 0),
            price: Number(variant.price || 0),
            costPrice: Number(variant.costPrice || 0),
            weight: Number(variant.weight || 0),
            status: Boolean(variant.status),
            images,
          };
        }),
      );

      const productPayload = {
        brandId: Number(formData.brandId),
        categoryId: Number(formData.categoryId),
        materialId: Number(formData.materialId),
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        productVariants: productVariantsPayload,
      };

      console.info("Create product payload prepared", {
        variantCount: productPayload.productVariants.length,
      });

      const responseBody = await productAPI.create(productPayload);
      if (!responseBody || responseBody.status !== 0) {
        throw new Error(responseBody?.message || "Tạo sản phẩm thất bại");
      }

      const createdData = responseBody.data;
      const createdProductId = createdData?.productId;
      if (!createdProductId) {
        throw new Error("Không nhận được productId sau khi tạo sản phẩm");
      }

      console.info("Create product success", {
        productId: createdProductId,
      });
      showToast(responseBody.message || "Thêm sản phẩm thành công", "success");
      navigate(`/admin/products/detail/${createdProductId}`);
    } catch (err) {
      console.error("Error saving product:", err);
      const beMessage = err?.response?.data?.message;
      showToast(beMessage || err.message || "Tạo sản phẩm thất bại", "error");
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
          Thêm sản phẩm mới
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
                className={errors.name ? "error" : ""}
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
                  <option key={material.materialId || material.id} value={material.materialId || material.id}>
                    {material.materialName || material.name}
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
                *Danh mục
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
                <option value="">Chọn danh mục</option>
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

        {/* Chọn Màu sắc & Trọng lượng */}
        <section
          style={{
            marginBottom: "32px",
            background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <h3
            style={{
              marginBottom: "16px",
              fontSize: "16px",
              fontWeight: "700",
              color: "#1f2937",
            }}
          >
            Màu sắc & Trọng lượng
          </h3>

          {/* Chọn Trọng lượng */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "10px",
                display: "block",
              }}
            >
              *Trọng lượng / Size ({selectedSizes.length} đã chọn)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "10px",
              }}
            >
              {sizes.map((size) => {
                const checked = selectedSizes.includes(size.sizeId);
                return (
                  <label
                    key={size.sizeId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      padding: "10px 12px",
                      border: checked ? "2px solid #4f46e5" : "1px solid #d1d5db",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: checked ? "#eef2ff" : "#fff",
                      boxShadow: checked ? "0 4px 12px rgba(79, 70, 229, 0.15)" : "none",
                      transform: checked ? "translateY(-1px)" : "translateY(0)",
                      transition: "all 0.22s ease",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                      {size.sizeName}
                    </span>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleSizeToggle(size.sizeId)}
                      style={{ display: "none" }}
                    />

                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: checked ? "#4f46e5" : "#e5e7eb",
                        transition: "all 0.22s ease",
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Chọn Màu sắc */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "10px",
                display: "block",
              }}
            >
              *Màu sắc ({selectedColors.length} đã chọn)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                gap: "10px",
              }}
            >
              {colors.map((color) => {
                const checked = selectedColors.includes(color.colorId);
                return (
                  <label
                    key={color.colorId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border: checked ? "2px solid #0ea5e9" : "1px solid #d1d5db",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: checked ? "#f0f9ff" : "#fff",
                      boxShadow: checked ? "0 4px 12px rgba(14, 165, 233, 0.16)" : "none",
                      transform: checked ? "translateY(-1px)" : "translateY(0)",
                      transition: "all 0.22s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleColorToggle(color.colorId)}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        backgroundColor: color.colorCode || "#ccc",
                        borderRadius: "50%",
                        border: "1px solid #94a3b8",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "13px", fontWeight: 500, flex: 1 }}>{color.colorName}</span>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: checked ? "#0ea5e9" : "#e5e7eb",
                        transition: "all 0.22s ease",
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
            Biến thể sản phẩm sẽ tự động tạo khi bạn chọn đủ màu và kích cỡ.
          </div>
        </section>
        {/* Danh sách biến thể theo màu */}
        {variants.length > 0 && (
          <section style={{ marginBottom: "32px" }}>
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
                      {group.variants.length} biến thể
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {group.variants.map((v) => {
                    const size = sizes.find((s) => s.sizeId === v.sizeId);
                    return (
                      <div
                        key={v.id}
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          padding: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1fr",
                            gap: "12px",
                            alignItems: "end",
                          }}
                        >
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
                              Biến thể
                            </label>
                            <h5
                              style={{
                                margin: "0 0 4px 0",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#1f2937",
                              }}
                            >
                              {group.colorName} - {size?.sizeName}
                            </h5>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>SKU: {v.sku}</div>
                          </div>

                          <div>
                            <label style={{ fontSize: "12px", fontWeight: "500", color: "#4b5563", display: "block", marginBottom: "4px" }}>
                              # Số lượng
                            </label>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => updateVariantStock(v.id, e.target.value)}
                              min="0"
                              style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "12px", fontWeight: "500", color: "#4b5563", display: "block", marginBottom: "4px" }}>
                              $ Đơn giá (VND)
                            </label>
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => updateVariantPrice(v.id, e.target.value)}
                              min="0"
                              step="1000"
                              style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "12px", fontWeight: "500", color: "#4b5563", display: "block", marginBottom: "4px" }}>
                              $ Giá nhập (VND)
                            </label>
                            <input
                              type="number"
                              value={v.costPrice ?? 0}
                              onChange={(e) => updateVariantCostPrice(v.id, e.target.value)}
                              min="0"
                              step="1000"
                              style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "12px", fontWeight: "500", color: "#4b5563", display: "block", marginBottom: "4px" }}>
                              ⚖ Cân nặng (kg)
                            </label>
                            <input
                              type="number"
                              value={v.weight ?? 0}
                              onChange={(e) => updateVariantWeight(v.id, e.target.value)}
                              min="0"
                              step="0.01"
                              style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "12px", fontWeight: "500", color: "#4b5563", display: "block", marginBottom: "4px" }}>
                              Trạng thái
                            </label>
                            <select
                              value={String(v.status ?? true)}
                              onChange={(e) => updateVariantStatus(v.id, e.target.value === "true")}
                              style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", width: "100%" }}
                            >
                              <option value="true">Hoạt động</option>
                              <option value="false">Không hoạt động</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ marginTop: "12px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <label
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                color: "#4b5563",
                              }}
                            >
                              Ảnh biến thể
                            </label>
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[v.id]?.click()}
                              style={{
                                padding: "6px 10px",
                                border: "1px solid #c7d2fe",
                                backgroundColor: "#eef2ff",
                                color: "#4338ca",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              + Chọn thêm ảnh
                            </button>
                          </div>

                          <input
                            ref={(el) => {
                              fileInputRefs.current[v.id] = el;
                            }}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              handleVariantImageChange(v.id, e.target.files)
                            }
                            style={{ display: "none" }}
                          />

                          {(variantImages[v.id] || []).length === 0 ? (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#9ca3af",
                                padding: "8px",
                                border: "1px dashed #d1d5db",
                                borderRadius: "6px",
                                textAlign: "center",
                                minHeight: "34px",
                              }}
                            >
                              Chưa chọn ảnh nào
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              {variantImages[v.id].map((file, idx) => (
                                <div
                                  key={`${v.id}-${idx}`}
                                  style={{ position: "relative" }}
                                >
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`variant-${v.id}-${idx}`}
                                    style={{
                                      width: "64px",
                                      height: "64px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                      border: "1px solid #d1d5db",
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeVariantImage(v.id, idx)}
                                    style={{
                                      position: "absolute",
                                      top: "-6px",
                                      right: "-6px",
                                      width: "18px",
                                      height: "18px",
                                      borderRadius: "50%",
                                      border: "none",
                                      backgroundColor: "#ef4444",
                                      color: "#fff",
                                      fontSize: "11px",
                                      lineHeight: "18px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
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
            style={{ marginBottom: "16px", color: "#dc2626", fontSize: "13px" }}
          >
            {errors.variants}
          </div>
        )}

        {errors.variantImages && (
          <div
            style={{ marginBottom: "16px", color: "#dc2626", fontSize: "13px" }}
          >
            {errors.variantImages}
          </div>
        )}

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
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAddPage;
