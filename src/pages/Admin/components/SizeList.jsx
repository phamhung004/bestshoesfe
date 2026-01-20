import React, { useState, useEffect, useCallback } from 'react';
import { sizeAPI } from '../../../services/api';
import './BrandList.css';

const SizeList = ({ onEdit, onAdd, refreshTrigger }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sizeAPI.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải kích cỡ');
      console.error('Error loading sizes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshTrigger]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xóa kích cỡ "${name}"?`)) {
      try {
        await sizeAPI.delete(id);
        await loadItems();
        alert('Xóa thành công');
      } catch (err) {
        alert('Không thể xóa kích cỡ.');
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await sizeAPI.toggleStatus(id);
      await loadItems();
    } catch (err) {
      alert('Không thể thay đổi trạng thái.');
    }
  };

  if (loading) return <div className="brand-list-loading"><p>Đang tải...</p></div>;
  if (error) return <div className="brand-list-error"><p>{error}</p></div>;

  return (
    <div className="brand-list">
      <div className="brand-list-header">
        <div className="header-left">
          <h2 className="section-title">Kích cỡ</h2>
          <div className="brand-count">Tổng: {items.length}</div>
        </div>
        <div className="header-right">
          <button onClick={onAdd} className="btn-primary">Thêm kích cỡ mới</button>
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
            {items.length === 0 ? <tr><td colSpan="4">Chưa có kích cỡ</td></tr> : (
              items.map(it => (
                <tr key={it.sizeId}>
                  <td>{it.sizeId}</td>
                  <td>{it.sizeName}</td>
                  <td>
                    <button onClick={() => handleToggle(it.sizeId)} className={`status-toggle ${it.status ? 'active' : 'inactive'}`}>
                      {it.status ? 'Hoạt động' : 'Ẩn'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => onEdit(it)} className="btn-edit">✏️</button>
                    <button onClick={() => handleDelete(it.sizeId, it.sizeName)} className="btn-delete">🗑️</button>
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

export default SizeList;


