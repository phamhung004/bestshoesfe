import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "./ProductDetail.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value) || 0,
  );

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);


  const variants = useMemo(
    () => (Array.isArray(product?.productVariants) ? product.productVariants : []),
    [product],
  );

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await productAPI.getById(id);
      const wrapped = typeof response?.status === "number";
      const apiStatus = wrapped ? response.status : 0;
      const detail = wrapped ? response?.data : response;
      const message = wrapped ? response?.message : null;

      if (apiStatus !== 0 || !detail) {
        throw new Error(message || "Không thể tải chi tiết sản phẩm");
      }

      setProduct({
        ...detail,
        productVariants: Array.isArray(detail?.productVariants)
          ? detail.productVariants
          : [],
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Không thể tải chi tiết sản phẩm";
      setError(message);
      showToast(message, "error");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);


  if (loading) {
    return (
      <div className="product-detail-state-card">
        <div className="detail-loading-spinner" />
        <p>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-state-card product-detail-state-card--error">
        <h3>{error || "Không tìm thấy sản phẩm"}</h3>
        <button className="admin-btn admin-btn--secondary" onClick={() => navigate("/admin/products/list")}>
          Quay về danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-toolbar">
        <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/admin/products/list")}>
          ← Quay lại danh sách
        </button>
      </div>

      <section className="product-header-card">
        <div>
          <h1 className="product-title">{product.name || "Sản phẩm"}</h1>
          <div className="product-meta-row">
            <span>Thương hiệu: {product.brandName || "—"}</span>
            <span>Danh mục: {product.categoryName || "—"}</span>
            <span>Chất liệu: {product.materialName || "—"}</span>
          </div>
          <p className="product-description">{product.description || "Chưa có mô tả"}</p>
        </div>

        <div className="product-header-side">
          <span className={`status-badge ${product.status ? "status-badge--active" : "status-badge--inactive"}`}>
            {product.status ? "Hoạt động" : "Không hoạt động"}
          </span>
          <div className="stock-pill">Tổng tồn kho: {Number(product.quantity) || 0}</div>
          <div className="stock-pill">Số biến thể: {variants.length}</div>
        </div>
      </section>

      <section className="variant-table-card">
        <div className="variant-table-title-wrap">
          <h2>Danh sách biến thể sản phẩm</h2>
          <p>Hiển thị thông tin gọn để thao tác nhanh</p>
        </div>

        <div className="variant-table-scroll">
          <table className="variant-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Màu</th>
                <th>Size</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {variants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="variant-empty-row">
                    Sản phẩm chưa có biến thể nào
                  </td>
                </tr>
              ) : (
                variants.map((variant) => (
                  <tr key={variant.variantId}>
                    <td>{variant.sku || "—"}</td>
                    <td>
                      <div className="color-cell">
                        <span
                          className="color-dot"
                          style={{ backgroundColor: variant.colorCode || "#CBD5E1" }}
                        />
                        <span>{variant.colorName || "—"}</span>
                      </div>
                    </td>
                    <td>{variant.sizeName || "—"}</td>
                    <td>{formatCurrency(variant.price)}</td>
                    <td>{Number(variant.quantity) || 0}</td>
                    <td>
                      <span
                        className={`status-badge ${variant.status ? "status-badge--active" : "status-badge--inactive"}`}
                      >
                        {variant.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="admin-btn admin-btn--primary"
                          onClick={() => navigate(`/admin/product-variants/${variant.variantId}/edit`)}
                        >
                          Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default ProductDetail;
