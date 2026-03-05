import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  productVariantAPI,
  productAPI,
  sizeAPI,
  colorAPI,
} from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import { useDebounce } from "../../../../hooks/useDebounce";
import Pagination from "../Pagination";
import "../Brand/BrandList.css";

const ProductVariantList = ({ onEdit, onAdd, refreshTrigger }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchProductId, setSearchProductId] = useState("");
  const [searchSizeId, setSearchSizeId] = useState("");
  const [searchColorId, setSearchColorId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  // Debounce search filter values
  const debouncedSearchProductId = useDebounce(searchProductId, 300);
  const debouncedSearchSizeId = useDebounce(searchSizeId, 300);
  const debouncedSearchColorId = useDebounce(searchColorId, 300);
  const debouncedSearchStatus = useDebounce(searchStatus, 300);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [productsRes, sizesRes, colorsRes] = await Promise.all([
          productAPI.getAll(undefined, 0, 5),
          sizeAPI.getAll(undefined, 0, 5),
          colorAPI.getAll(undefined, 0, 5),
        ]);

        setProducts(productsRes?.data?.content || []);
        setSizes(sizesRes?.data?.content || []);
        setColors(colorsRes?.data?.content || []);
      } catch (err) {
        console.error("Error loading filter options:", err);
      }
    };

    loadFilterOptions();
  }, []);

  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);
      const productId = debouncedSearchProductId.trim()
        ? parseInt(debouncedSearchProductId)
        : undefined;
      const sizeId = debouncedSearchSizeId.trim()
        ? parseInt(debouncedSearchSizeId)
        : undefined;
      const colorId = debouncedSearchColorId.trim()
        ? parseInt(debouncedSearchColorId)
        : undefined;
      const status = debouncedSearchStatus
        ? debouncedSearchStatus === "true"
        : undefined;

      const response = await productVariantAPI.getAll(
        productId,
        sizeId,
        colorId,
        status,
        currentPage,
        pageSize,
      );

      const variantsList =
        response?.data?.content || response?.content || response || [];
      setVariants(Array.isArray(variantsList) ? variantsList : []);
      setTotalItems(response?.data?.totalElements || variantsList.length || 0);
      setError(null);
    } catch (err) {
      setError("Không thể tải biến thể sản phẩm");
      console.error("Error loading variants:", err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchProductId,
    debouncedSearchSizeId,
    debouncedSearchColorId,
    debouncedSearchStatus,
  ]);

  useEffect(() => {
    setCurrentPage(0);
  }, [
    debouncedSearchProductId,
    debouncedSearchSizeId,
    debouncedSearchColorId,
    debouncedSearchStatus,
  ]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants, refreshTrigger]);

  const handleDelete = async (variantId) => {
    if (window.confirm("Bạn có chắc muốn xóa biến thể này?")) {
      try {
        await productVariantAPI.delete(variantId);
        await loadVariants();
        showToast("Xóa biến thể thành công", "success");
      } catch (err) {
        showToast("Không thể xóa biến thể.", "error");
      }
    }
  };

  const handleToggle = async (variantId) => {
    try {
      await productVariantAPI.toggleStatus(variantId);
      await loadVariants();
      showToast("Cập nhật trạng thái thành công", "success");
    } catch (err) {
      showToast("Không thể thay đổi trạng thái.", "error");
    }
  };

  if (loading) {
    return (
      <div className="brand-list-loading">
        <p>Đang tải biến thể sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-list-error">
        <p>{error}</p>
        <button onClick={() => loadVariants()} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="brand-list">
      <div className="brand-list-header">
        <div className="header-left">
          <h2 className="section-title">Quản lý biến thể sản phẩm</h2>
          <div className="brand-count">Tổng cộng: {totalItems} biến thể</div>
        </div>
        <div className="header-right">
          <button onClick={onAdd} className="btn-primary">
            Thêm biến thể mới
          </button>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label>Sản phẩm:</label>
          <select
            value={searchProductId}
            onChange={(e) => setSearchProductId(e.target.value)}
            className="search-input"
          >
            <option value="">Tất cả sản phẩm</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Size:</label>
          <select
            value={searchSizeId}
            onChange={(e) => setSearchSizeId(e.target.value)}
            className="search-input"
          >
            <option value="">Tất cả size</option>
            {sizes.map((s) => (
              <option key={s.sizeId} value={s.sizeId}>
                {s.sizeName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Màu:</label>
          <select
            value={searchColorId}
            onChange={(e) => setSearchColorId(e.target.value)}
            className="search-input"
          >
            <option value="">Tất cả màu</option>
            {colors.map((c) => (
              <option key={c.colorId} value={c.colorId}>
                {c.colorName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            className="search-input"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>
      </div>

      <div className="brand-table-container">
        <table className="brand-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Size</th>
              <th>Màu</th>
              <th>Giá (₫)</th>
              <th>Giá vốn (₫)</th>
              <th>Trọng lượng (kg)</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  Không có biến thể nào
                </td>
              </tr>
            ) : (
              variants.map((variant) => (
                <tr key={variant.variantId}>
                  <td>{variant.variantId}</td>
                  <td>{variant.product?.name || "N/A"}</td>
                  <td>{variant.size?.sizeName || "N/A"}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: variant.color?.colorCode || "#ccc",
                          borderRadius: "3px",
                          border: "1px solid #ddd",
                        }}
                      />
                      {variant.color?.colorName || "N/A"}
                    </div>
                  </td>
                  <td>{variant.price?.toLocaleString("vi-VN")}</td>
                  <td>{variant.costPrice?.toLocaleString("vi-VN")}</td>
                  <td>{variant.weight}</td>
                  <td>
                    <span
                      className={`status-${variant.status ? "active" : "inactive"}`}
                    >
                      {variant.status ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() =>
                        navigate(
                          `/admin/product-variants/detail/${variant.variantId}`,
                        )
                      }
                    >
                      Chi tiết
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => onEdit && onEdit(variant)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn-toggle"
                      onClick={() => handleToggle(variant.variantId)}
                    >
                      {variant.status ? "Tắt" : "Bật"}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(variant.variantId)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductVariantList;
