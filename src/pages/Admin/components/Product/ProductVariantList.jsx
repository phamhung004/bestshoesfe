import React, { useState, useEffect } from "react";
import { productVariantAPI, colorAPI, sizeAPI } from "../../../../services/api";
import Pagination from "../Pagination";
import ProductVariantForm from "./ProductVariantForm";
import "./Product.css";

const ProductVariantList = ({ productId, productName, onBack }) => {
  const [variants, setVariants] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [colors, setColors] = useState({});
  const [sizes, setSizes] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantPrimaryImages, setVariantPrimaryImages] = useState({});

  useEffect(() => {
    loadVariants();
  }, [currentPage, statusFilter, searchText, colors, productId]);

  useEffect(() => {
    loadColors();
    loadSizes();
  }, []);

  const loadPrimaryImagesForVariants = async (variantItems) => {
    if (!variantItems?.length) {
      setVariantPrimaryImages({});
      return;
    }

    const entries = await Promise.all(
      variantItems.map(async (variant) => {
        try {
          const rs = await productVariantAPI.getImages(variant.variantId);
          const data = rs?.data || rs || {};
          const primary = data?.primaryImage || (data?.images || []).find((img) => img.isPrimary) || null;
          return [variant.variantId, primary?.imageUrl || null];
        } catch {
          return [variant.variantId, null];
        }
      }),
    );

    setVariantPrimaryImages(Object.fromEntries(entries));
  };

  const loadVariants = async () => {
    try {
      setLoading(true);
      const response = await productVariantAPI.getAll(productId, null, null, null, 0, 5);
      let items = response?.data?.content || response?.content || [];

      if (statusFilter === "Hoạt động") {
        items = items.filter((v) => v.status === true);
      } else if (statusFilter === "Không hoạt động") {
        items = items.filter((v) => v.status === false);
      }

      if (searchText.trim()) {
        const keyword = searchText.toLowerCase();
        items = items.filter(
          (v) => v.sku?.toLowerCase().includes(keyword) || colors[v.colorId]?.name?.toLowerCase().includes(keyword),
        );
      }

      const pagedItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
      setVariants(pagedItems);
      setTotalItems(items.length);
      await loadPrimaryImagesForVariants(pagedItems);
    } catch (err) {
      console.error("Error loading variants:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadColors = async () => {
    try {
      const response = await colorAPI.getAll(null, 0, 100);
      const colorMap = {};
      (response?.data?.content || response?.content || []).forEach((color) => {
        colorMap[color.colorId || color.id] = {
          name: color.colorName,
          hex: color.colorCode || "#000000",
        };
      });
      setColors(colorMap);
    } catch (err) {
      console.error("Error loading colors:", err);
    }
  };

  const loadSizes = async () => {
    try {
      const response = await sizeAPI.getAll(null, 0, 100);
      const sizeMap = {};
      (response?.data?.content || response?.content || []).forEach((size) => {
        sizeMap[size.sizeId || size.id] = size.sizeName;
      });
      setSizes(sizeMap);
    } catch (err) {
      console.error("Error loading sizes:", err);
    }
  };

  const handleDelete = async (variantId) => {
    if (window.confirm("Bạn chắc chắn muốn xóa biến thể này?")) {
      try {
        await productVariantAPI.delete(variantId);
        alert("Xóa thành công");
        await loadVariants();
      } catch (err) {
        console.error("Error deleting variant:", err);
        alert("Lỗi xóa biến thể");
      }
    }
  };

  const handleToggleStatus = async (variant) => {
    try {
      await productVariantAPI.toggleStatus(variant.variantId);
      await loadVariants();
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
  };

  const handleSaveVariant = async () => {
    setEditingVariant(null);
    await loadVariants();
  };

  return (
    <div style={{ padding: "0" }}>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          fontSize: "13px",
          color: "#6b7280",
          backgroundColor: "#ffffff",
        }}
      >
        <button
          onClick={onBack}
          style={{
            color: "#3b82f6",
            cursor: "pointer",
            border: "none",
            background: "none",
            padding: "0",
            marginRight: "8px",
            fontSize: "13px",
            textDecoration: "underline",
          }}
        >
          Sản phẩm
        </button>
        / {productName}
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Nhập SKU hoặc tên màu để tìm..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(0);
              }}
              style={{
                flex: 1,
                minWidth: "250px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "500", color: "#4b5563" }}>Lọc theo trạng thái:</span>
            {["Tất cả", "Hoạt động", "Không hoạt động"].map((status) => (
              <label key={status} style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "6px" }}>
                <input
                  type="radio"
                  name="status"
                  checked={statusFilter === status}
                  onChange={() => {
                    setStatusFilter(status);
                    setCurrentPage(0);
                  }}
                  style={{ margin: "0" }}
                />
                <span style={{ fontSize: "13px" }}>{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ padding: "16px 24px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
              Danh sách biến thể ({totalItems})
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Đang tải...</div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f4f6" }}>
                      <th style={thStyle}>STT</th>
                      <th style={thStyle}>ẢNH</th>
                      <th style={thStyle}>MÃ SẢN PHẨM</th>
                      <th style={thStyle}>MÀU</th>
                      <th style={thStyle}>KÍCH CỠ</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>ĐƠN GIÁ</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>SỐ LƯỢNG</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>TRẠNG THÁI</th>
                      <th style={{ ...thStyle, textAlign: "center" }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af" }}>
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      variants.map((variant, idx) => (
                        <tr key={variant.variantId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "12px 16px", fontSize: "13px" }}>{currentPage * pageSize + idx + 1}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {variantPrimaryImages[variant.variantId] ? (
                              <img
                                src={variantPrimaryImages[variant.variantId]}
                                alt={variant.sku}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "6px",
                                  objectFit: "cover",
                                  border: "1px solid #e5e7eb",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: "#f3f4f6",
                                  borderRadius: "6px",
                                  fontSize: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#9ca3af",
                                }}
                              >
                                No Img
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500" }}>{variant.sku}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  backgroundColor: colors[variant.colorId]?.hex || "#e5e7eb",
                                  borderRadius: "3px",
                                  border: "1px solid #d1d5db",
                                }}
                              />
                              <span style={{ fontSize: "13px" }}>{colors[variant.colorId]?.name || "N/A"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px" }}>{sizes[variant.sizeId] || "N/A"}</td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500", textAlign: "right" }}>
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              variant.price || 0,
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", textAlign: "center" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                display: "inline-block",
                                backgroundColor: variant.stock > 10 ? "#dcfce7" : variant.stock > 0 ? "#fef3c7" : "#fee2e2",
                                color: variant.stock > 10 ? "#166534" : variant.stock > 0 ? "#92400e" : "#991b1b",
                                fontWeight: "500",
                              }}
                            >
                              {variant.stock}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <button
                              onClick={() => handleToggleStatus(variant)}
                              style={{
                                padding: "4px 12px",
                                borderRadius: "4px",
                                border: "none",
                                fontSize: "12px",
                                fontWeight: "500",
                                cursor: "pointer",
                                backgroundColor: variant.status ? "#dcfce7" : "#fee2e2",
                                color: variant.status ? "#166534" : "#991b1b",
                              }}
                            >
                              {variant.status ? "Hoạt động" : "Dừng"}
                            </button>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                onClick={() => handleEdit(variant)}
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#dbeafe",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  color: "#1e40af",
                                  fontWeight: "500",
                                }}
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(variant.variantId)}
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#fee2e2",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  color: "#991b1b",
                                  fontWeight: "500",
                                }}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb" }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / pageSize)}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {editingVariant && (
        <ProductVariantForm
          variant={editingVariant}
          productName={productName}
          onSave={handleSaveVariant}
          onCancel={() => setEditingVariant(null)}
        />
      )}
    </div>
  );
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  borderBottom: "1px solid #e5e7eb",
};

export default ProductVariantList;
