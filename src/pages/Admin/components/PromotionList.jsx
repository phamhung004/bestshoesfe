import React, { useState, useEffect, useCallback } from "react";
import { promotionAPI } from "../../../services/api";
import Pagination from "./Pagination";
import "./PromotionList.css";

const PromotionList = ({ onEdit, onAdd, refreshTrigger }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const loadPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await promotionAPI.getAll(currentPage, pageSize);
      const promotionsList = data?.data?.content || data?.content || data || [];
      setPromotions(Array.isArray(promotionsList) ? promotionsList : []);
      setTotalItems(
        data?.data?.totalElements ||
          data?.totalElements ||
          promotionsList.length,
      );
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách đợt giảm giá");
      console.error("Error loading promotions:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions, refreshTrigger]);

  useEffect(() => {
    // Filter promotions based on search term and filters
    let filtered = promotions;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((promotion) =>
        statusFilter === "active" ? promotion.isActive : !promotion.isActive,
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((promotion) => promotion.type === typeFilter);
    }

    // Search term filter
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (promotion) =>
          promotion.name?.toLowerCase().includes(searchLower) ||
          promotion.description?.toLowerCase().includes(searchLower),
      );
    }

    setFilteredPromotions(filtered);
  }, [promotions, searchTerm, statusFilter, typeFilter]);

  const handleDelete = async (promotionId, promotionName) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa đợt giảm giá "${promotionName}"?`,
      )
    ) {
      try {
        await promotionAPI.delete(promotionId);
        setPromotions((prevPromotions) =>
          prevPromotions.filter((p) => p.promotionId !== promotionId),
        );
        alert("Xóa đợt giảm giá thành công!");
      } catch (err) {
        alert("Không thể xóa đợt giảm giá. Vui lòng thử lại.");
        console.error("Error deleting promotion:", err);
      }
    }
  };

  const handleToggleStatus = async (promotionId, currentStatus) => {
    try {
      const updatedPromotion = await promotionAPI.toggleStatus(promotionId);
      setPromotions((prevPromotions) =>
        prevPromotions.map((promotion) =>
          promotion.promotionId === promotionId ? updatedPromotion : promotion,
        ),
      );
    } catch (err) {
      alert("Không thể thay đổi trạng thái đợt giảm giá. Vui lòng thử lại.");
      console.error("Error toggling promotion status:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    const isExpired = now > endDate;
    const isUpcoming = now < startDate;
    const isActive = promotion.isActive && !isExpired && !isUpcoming;

    if (!promotion.isActive)
      return <span className="status-badge inactive">Đã tắt</span>;
    if (isExpired) return <span className="status-badge expired">Hết hạn</span>;
    if (isUpcoming)
      return <span className="status-badge upcoming">Sắp tới</span>;
    if (isActive) return <span className="status-badge active">Hoạt động</span>;
    return <span className="status-badge unknown">Không xác định</span>;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "flash_sale":
        return <span className="type-badge flash-sale">Flash Sale</span>;
      case "seasonal":
        return <span className="type-badge seasonal">Theo mùa</span>;
      case "clearance":
        return <span className="type-badge clearance">Thanh lý</span>;
      case "special":
        return <span className="type-badge special">Đặc biệt</span>;
      default:
        return <span className="type-badge default">{type}</span>;
    }
  };

  if (loading) {
    return (
      <div className="promotion-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách đợt giảm giá...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="promotion-list-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => loadPromotions()} className="btn-retry">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="promotion-list">
      <div className="promotion-list-header">
        <div className="header-left">
          <h2 className="section-title">Quản lý đợt giảm giá</h2>
          <div className="promotion-count">
            Tổng cộng: {filteredPromotions.length} đợt giảm giá
          </div>
        </div>
        <div className="header-right">
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="status-filter" className="filter-label">
                Trạng thái:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Đã tắt</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="type-filter" className="filter-label">
                Loại:
              </label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="seasonal">Theo mùa</option>
                <option value="clearance">Thanh lý</option>
                <option value="special">Đặc biệt</option>
              </select>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm đợt giảm giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          <button onClick={onAdd} className="btn-primary">
            Thêm đợt giảm giá mới
          </button>
        </div>
      </div>

      <div className="promotion-table-container">
        <table className="promotion-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đợt giảm giá</th>
              <th>Loại</th>
              <th>Phần trăm giảm</th>
              <th>Số tiền giảm</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Không tìm thấy đợt giảm giá nào phù hợp"
                    : "Chưa có đợt giảm giá nào"}
                </td>
              </tr>
            ) : (
              filteredPromotions.map((promotion) => (
                <tr key={promotion.promotionId}>
                  <td>{promotion.promotionId}</td>
                  <td className="promotion-name">
                    <div className="name-cell">
                      <span className="name-text">{promotion.name}</span>
                      {promotion.description && (
                        <span className="name-description">
                          {promotion.description.substring(0, 50)}
                          {promotion.description.length > 50 ? "..." : ""}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{getTypeBadge(promotion.type)}</td>
                  <td className="promotion-discount">
                    {promotion.discountPercentage
                      ? `${promotion.discountPercentage}%`
                      : "-"}
                  </td>
                  <td className="promotion-amount">
                    {promotion.discountAmount
                      ? formatCurrency(promotion.discountAmount)
                      : "-"}
                  </td>
                  <td className="date-range">
                    <div className="date-start">
                      <small>Từ:</small> {formatDate(promotion.startDate)}
                    </div>
                    <div className="date-end">
                      <small>Đến:</small> {formatDate(promotion.endDate)}
                    </div>
                  </td>
                  <td>{getStatusBadge(promotion)}</td>
                  <td>{formatDate(promotion.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(promotion)}
                        className="btn-edit"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            promotion.promotionId,
                            promotion.isActive,
                          )
                        }
                        className="btn-toggle"
                        title={
                          promotion.isActive
                            ? "Tắt đợt giảm giá"
                            : "Bật đợt giảm giá"
                        }
                      >
                        {promotion.isActive ? "👁️" : "🙈"}
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(promotion.promotionId, promotion.name)
                        }
                        className="btn-delete"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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

export default PromotionList;
