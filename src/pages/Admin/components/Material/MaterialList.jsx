import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { materialAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import { useDebounce } from "../../../../hooks/useDebounce";
import Pagination from "../Pagination";
import "../Brand/BrandList.css";

const MaterialList = ({ onEdit, onAdd, refreshTrigger }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getAll(
        debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined,
        currentPage,
        pageSize,
      );
      // Backend returns: { status: 0, message: "...", data: { content: [...], ... } }
      const itemsList =
        response?.data?.content || response?.content || response || [];
      setItems(Array.isArray(itemsList) ? itemsList : []);
      setTotalItems(response?.data?.totalElements || itemsList.length || 0);
      setError(null);
    } catch (err) {
      setError("Không thể tải chất liệu");
      console.error("Error loading materials:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(0); // Reset to first page when search changes
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xóa chất liệu "${name}"?`)) {
      try {
        await materialAPI.delete(id);
        await loadItems();
        showToast("Xóa chất liệu thành công", "success");
      } catch (err) {
        showToast("Không thể xóa chất liệu.", "error");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await materialAPI.toggleStatus(id);
      await loadItems();
      showToast("Cập nhật trạng thái thành công", "success");
    } catch (err) {
      showToast("Không thể thay đổi trạng thái.", "error");
    }
  };

  if (loading)
    return (
      <div className="brand-list-loading">
        <p>Đang tải...</p>
      </div>
    );
  if (error)
    return (
      <div className="brand-list-error">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="brand-list">
      <div className="brand-list-header">
        <div className="header-left">
          <h2 className="section-title">Chất liệu</h2>
          <div className="brand-count">Tổng cộng: {totalItems} chất liệu</div>
        </div>
        <div className="header-right">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm chất liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button onClick={onAdd} className="btn-primary">
            Thêm chất liệu mới
          </button>
        </div>
      </div>

      <div className="brand-table-container">
        <table className="brand-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã</th>
              <th>Tên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5">Chưa có chất liệu</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.materialId}>
                  <td>{it.materialId}</td>
                  <td>{it.materialCode || "N/A"}</td>
                  <td>{it.materialName}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(it.materialId)}
                      className={`status-toggle ${it.status ? "active" : "inactive"}`}
                    >
                      {it.status ? "Hoạt động" : "Ẩn"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => onEdit(it)} className="btn-edit">
                      ✏️ Sửa
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

export default MaterialList;
