import React, { useState, useEffect, useCallback } from "react";
import { sizeAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import { useDebounce } from "../../../../hooks/useDebounce";
import "../Brand/BrandList.css";

const SizeList = ({ onEdit, onAdd, refreshTrigger }) => {
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
      const response = await sizeAPI.getAll(
        debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : undefined,
        currentPage,
        pageSize,
      );
      const itemsList =
        response?.data?.content || response?.content || response || [];
      setItems(Array.isArray(itemsList) ? itemsList : []);
      setTotalItems(
        response?.data?.totalElements ||
          response?.totalElements ||
          itemsList.length,
      );
      setError(null);
    } catch (err) {
      setError("Không thể tải kích cỡ");
      console.error("Error loading sizes:", err);
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
    if (window.confirm(`Xóa kích cỡ "${name}"?`)) {
      try {
        await sizeAPI.delete(id);
        await loadItems();
        showToast("Xóa kích cỡ thành công", "success");
      } catch (err) {
        showToast("Không thể xóa kích cỡ.", "error");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await sizeAPI.toggleStatus(id);
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
          <h2 className="section-title">Kích cỡ</h2>
          <div className="brand-count">Tổng: {totalItems}</div>
        </div>
        <div className="header-right">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên kích cỡ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={onAdd} className="btn-primary">
            Thêm kích cỡ mới
          </button>
        </div>
      </div>

      <div className="brand-table-container">
        <table className="brand-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên kích cỡ</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4">Chưa có kích cỡ</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.sizeId}>
                  <td>{it.sizeId}</td>
                  <td>{it.sizeName}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(it.sizeId)}
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

      {totalItems > pageSize && (
        <div className="pagination">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trang trước
          </button>
          <span>
            Trang {currentPage + 1} / {Math.ceil(totalItems / pageSize)}
          </span>
          <button
            disabled={currentPage >= Math.ceil(totalItems / pageSize) - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default SizeList;
