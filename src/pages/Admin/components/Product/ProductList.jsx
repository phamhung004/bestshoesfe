import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import { useDebounce } from "../../../../hooks/useDebounce";
import Pagination from "../Pagination";
import "../Brand/BrandList.css";

const ProductList = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll(undefined, 0, 1000);
      const productsList = Array.isArray(response?.data?.content)
        ? response.data.content
        : Array.isArray(response?.content)
          ? response.content
          : Array.isArray(response)
            ? response
            : [];

      let filtered = productsList;

      if (statusFilter === "Hoạt động") {
        filtered = filtered.filter((p) => p.status === true);
      } else if (statusFilter === "Không hoạt động") {
        filtered = filtered.filter((p) => p.status === false);
      }

      if (debouncedSearchTerm.trim()) {
        filtered = filtered.filter((p) =>
          p.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        );
      }

      const paginated = filtered.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize,
      );

      setProducts(paginated);
      setTotalItems(filtered.length);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshTrigger]);

  const handleToggleStatus = async (id) => {
    try {
      await productAPI.toggleStatus(id);
      await fetchProducts();
      showToast("Cập nhật trạng thái thành công", "success");
    } catch (err) {
      console.error("Toggle status failed", err);
      showToast("Cập nhật trạng thái thất bại", "error");
    }
  };

  const getProductPrimaryImageUrl = (product) => {
    const variants = Array.isArray(product?.productVariants)
      ? product.productVariants
      : [];

    for (const variant of variants) {
      const primaryUrl = variant?.primaryImage?.imageUrl;
      if (primaryUrl) return primaryUrl;

      const imageList = Array.isArray(variant?.images) ? variant.images : [];
      const primaryImage = imageList.find((image) => image?.isPrimary);
      if (primaryImage?.imageUrl) return primaryImage.imageUrl;
      if (imageList[0]?.imageUrl) return imageList[0].imageUrl;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="brand-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-list-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => fetchProducts()} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="brand-list">
      <div className="brand-list-header">
        <div className="header-left">
          <h2 className="section-title">Quản lý sản phẩm</h2>
          <div className="brand-count">Tổng cộng: {totalItems} sản phẩm</div>
        </div>

        <div className="header-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="btn-primary" onClick={() => navigate("/admin/products/add")}>
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "500", color: "#4b5563" }}>
            Lọc theo trạng thái:
          </span>
          {["Tất cả", "Hoạt động", "Không hoạt động"].map((status) => (
            <label
              key={status}
              style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "6px" }}
            >
              <input
                type="radio"
                name="status"
                checked={statusFilter === status}
                onChange={() => setStatusFilter(status)}
                style={{ margin: "0" }}
              />
              <span style={{ fontSize: "13px" }}>{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="brand-table-container">
        <table className="brand-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((p, idx) => {
                const primaryImageUrl = getProductPrimaryImageUrl(p);

                return (
                  <tr key={p.productId || p.id}>
                    <td>{currentPage * pageSize + idx + 1}</td>
                    <td>
                      {primaryImageUrl ? (
                        <img
                          src={primaryImageUrl}
                          alt={p.name || "product-image"}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "6px",
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          👟
                        </div>
                      )}
                    </td>
                    <td className="brand-name">{p.name}</td>
                    <td>{Number(p.quantity) || 0}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(p.productId || p.id)}
                        className={`status-toggle ${p.status ? "active" : "inactive"}`}
                      >
                        {p.status ? "Hoạt động" : "Ẩn"}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/products/detail/${p.productId || p.id}`)}
                        title="Xem chi tiết"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / pageSize)}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductList;
