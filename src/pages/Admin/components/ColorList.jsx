import React, { useState, useEffect, useCallback } from "react";
import { colorAPI } from "../../../services/api";
import Pagination from "./Pagination";
import "./Brand/BrandList.css";

const ColorList = ({ onEdit, onAdd, refreshTrigger }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await colorAPI.getAll(currentPage, pageSize);
      // Backend returns: { status: 0, message: "...", data: { content: [...], totalElements: 100, ... } }
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
      setError("Không thể tải màu sắc");
      console.error("Error loading colors:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xóa màu "${name}"?`)) {
      try {
        await colorAPI.delete(id);
        await loadItems();
        alert("Xóa thành công");
      } catch (err) {
        alert("Không thể xóa màu.");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await colorAPI.toggleStatus(id);
      await loadItems();
    } catch (err) {
      alert("Không thể thay đổi trạng thái.");
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

  const formatColorCode = (code) => {
    if (!code) return "";
    const trimmed = String(code).trim();
    if (trimmed.startsWith("#")) return trimmed;
    return `#${trimmed}`;
  };

  return (
    <div className="brand-list">
      <div className="brand-list-header">
        <div className="header-left">
          <h2 className="section-title">Màu sắc</h2>
          <div className="brand-count">Tổng: {totalItems}</div>
        </div>
        <div className="header-right">
          <button onClick={onAdd} className="btn-primary">
            Thêm màu mới
          </button>
        </div>
      </div>

      <div className="brand-table-container">
        <table className="brand-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Preview</th>
              <th>Tên</th>
              <th>Mã màu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6">Chưa có màu</td>
              </tr>
            ) : (
              items.map((it) => {
                const displayCode = formatColorCode(it.colorCode);
                return (
                  <tr key={it.colorId}>
                    <td>{it.colorId}</td>
                    <td>
                      <div
                        className="color-swatch"
                        title={displayCode || "Không có mã màu"}
                        style={{
                          backgroundColor: displayCode || "transparent",
                          border: displayCode
                            ? "1px solid rgba(0,0,0,0.12)"
                            : "1px dashed #e5e7eb",
                        }}
                      />
                    </td>
                    <td>{it.colorName}</td>
                    <td>{displayCode || "N/A"}</td>
                    <td>
                      <button
                        onClick={() => handleToggle(it.colorId)}
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

export default ColorList;
