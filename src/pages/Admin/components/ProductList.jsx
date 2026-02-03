import React, { useState, useEffect } from 'react';
import { productAPI } from '../../../services/api';
import './BrandList.css';

const ProductList = ({ onEdit, onAdd, refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await productAPI.delete(id);
      fetchProducts();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Xóa thất bại');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await productAPI.toggleStatus(id);
      fetchProducts();
    } catch (err) {
      console.error('Toggle status failed', err);
      alert('Cập nhật trạng thái thất bại');
    }
  };

  if (loading) {
    return <div className="data-table"><p>Đang tải danh sách sản phẩm...</p></div>;
  }

  if (error) {
    return <div className="data-table"><p>{error}</p></div>;
  }

  return (
    <div className="admin-content-section">
      <div className="section-header">
        <h2 className="section-title">Quản lý sản phẩm</h2>
        <button className="btn-primary" onClick={() => onAdd && onAdd()}>Thêm sản phẩm mới</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId || p.id}>
                <td>{p.productId || p.id}</td>
                <td>{p.name}</td>
                <td>{p.status === false ? '-' : (p.price ? `$${p.price}` : 'N/A')}</td>
                <td>
                  <span className={`status-${p.status ? 'active' : 'inactive'}`}>
                    {p.status ? 'Còn hàng' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => onEdit && onEdit(p)}>Sửa</button>
                  <button className="btn-delete" onClick={() => handleDelete(p.productId || p.id)}>Xóa</button>
                  <button className="btn-toggle" onClick={() => handleToggleStatus(p.productId || p.id)}>
                    {p.status ? 'Tắt' : 'Bật'}
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5">Không có sản phẩm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;






