import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { brandAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "./BrandList.css";

const BrandList = ({ onEdit, onAdd, refreshTrigger }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await brandAPI.getAll(currentPage, pageSize);
      // Backend returns: { status: 0, message: "...", data: { content: [...], ... } }
      const brandsList =
        response?.data?.content || response?.content || response || [];
      setBrands(Array.isArray(brandsList) ? brandsList : []);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách thương hiệu");
      console.error("Error loading brands:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands, refreshTrigger]); // Reload khi refreshTrigger thay đổi

  useEffect(() => {
    // Filter brands based on search term
    if (searchTerm.trim() === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(
        (brand) =>
          brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (brand.description &&
            brand.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (brand.originCountry &&
            brand.originCountry
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
      setFilteredBrands(filtered);
    }
  }, [brands, searchTerm]);

  const handleDelete = async (brandId, brandName) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${brandName}"?`)
    ) {
      try {
        await brandAPI.delete(brandId);
        await loadBrands(); // Reload the list immediately
        showToast("Xóa thương hiệu thành công", "success");
      } catch (err) {
        showToast("Không thể xóa thương hiệu. Vui lòng thử lại.", "error");
        console.error("Error deleting brand:", err);
      }
    }
  };

  const handleToggleStatus = async (brandId, currentStatus) => {
    try {
      await brandAPI.toggleStatus(brandId);
      await loadBrands(); // Reload the list immediately
      showToast("Thay đổi trạng thái thành công", "success");
    } catch (err) {
      showToast("Không thể thay đổi trạng thái thương hiệu. Vui lòng thử lại.", "error");
      console.error("Error toggling brand status:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="brand-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách thương hiệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-list-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => loadBrands()} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="brand-list">
      <div className="brand-list-header">
        <div className="header-left">
          <h2 className="section-title">Quản lý thương hiệu</h2>
          <div className="brand-count">
            Tổng cộng: {filteredBrands.length} thương hiệu
          </div>
        </div>
        <div className="header-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button onClick={onAdd} className="btn-primary">
            Thêm thương hiệu mới
          </button>
        </div>
      </div>

      <div className="brand-table-container">
        <table className="brand-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>Tên thương hiệu</th>
              <th>Slug</th>
              <th>Mô tả</th>
              <th>Quốc gia</th>
              <th>Website</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  {searchTerm
                    ? "Không tìm thấy thương hiệu nào phù hợp"
                    : "Chưa có thương hiệu nào"}
                </td>
              </tr>
            ) : (
              filteredBrands.map((brand) => (
                <tr key={brand.brandId}>
                  <td>{brand.brandId}</td>
                  <td>
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="brand-logo"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="no-logo">📷</div>
                    )}
                  </td>
                  <td className="brand-name">{brand.name}</td>
                  <td className="brand-slug">{brand.slug}</td>
                  <td className="brand-description">
                    {brand.description ? (
                      <span title={brand.description}>
                        {brand.description.length > 50
                          ? brand.description.substring(0, 50) + "..."
                          : brand.description}
                      </span>
                    ) : (
                      <span className="no-description">Chưa có mô tả</span>
                    )}
                  </td>
                  <td>{brand.originCountry || "N/A"}</td>
                  <td>
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brand-website"
                      >
                        🌐 Xem
                      </a>
                    ) : (
                      <span className="no-website">N/A</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handleToggleStatus(brand.brandId, brand.status)
                      }
                      className={`status-toggle ${brand.status ? "active" : "inactive"}`}
                    >
                      {brand.status ? "Hoạt động" : "Ẩn"}
                    </button>
                  </td>
                  <td>{formatDate(brand.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => onEdit(brand)}
                      className="btn-edit"
                      title="Chỉnh sửa"
                    >
                      ✏️ Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BrandList;
