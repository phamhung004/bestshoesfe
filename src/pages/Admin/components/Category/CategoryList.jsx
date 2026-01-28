import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { categoryAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandList.css";

const CategoryList = ({ onEdit, onAdd, refreshTrigger }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll(currentPage, pageSize);
      // Backend returns: { status: 0, message: "...", data: { content: [...], ... } }
      const itemsList =
        response?.data?.content || response?.content || response || [];
      setItems(Array.isArray(itemsList) ? itemsList : []);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh mục");
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xóa danh mục "${name}"?`)) {
      try {
        await categoryAPI.delete(id);
        await loadItems();
        showToast("Xóa danh mục thành công", "success");
      } catch (err) {
        showToast("Không thể xóa danh mục.", "error");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await categoryAPI.toggleStatus(id);
      await loadItems();
      showToast("Cập nhật trạng thái thành công", "success");
    } catch (err) {
      showToast("Không thể thay đổi trạng thái.", "error");
    }
  };

  if (loading) {
    return (
      <div className="brand-list-loading">
        <p>Đang tải danh mục...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-list-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="brand-list">
      <div className="brand-list-header">
        <div className="header-left">
          <h2 className="section-title">Danh mục</h2>
          <div className="brand-count">Tổng: {items.length}</div>
        </div>
        <div className="header-right">
          <button onClick={onAdd} className="btn-primary">
            Thêm danh mục mới
          </button>
        </div>
      </div>

      <div className="brand-table-container">
        <table className="brand-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5">Chưa có danh mục</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.categoryId}>
                  <td>{item.categoryId}</td>
                  <td>{item.name}</td>
                  <td>
                    {item.description
                      ? item.description.length > 50
                        ? item.description.substring(0, 50) + "..."
                        : item.description
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggle(item.categoryId)}
                      className={`status-toggle ${item.status ? "active" : "inactive"}`}
                    >
                      {item.status ? "Hoạt động" : "Ẩn"}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => onEdit(item)} className="btn-edit">
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

export default CategoryList;
