import React, { useEffect, useState } from 'react';
import { customerAPI } from '../../../../services/api';
import './UserList.css';
import ConfirmDialog from '../../../../components/ConfirmDialog.jsx';

const CustomerList = ({ onAdd, onEdit }) => {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerAPI.getAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Không tải được danh sách khách hàng');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    // handled by ConfirmDialog
    try {
      await customerAPI.delete(id);
      await load();
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  // Pagination helpers
  const pageSize = 8;
  const q = query.trim().toLowerCase();
  const filteredCustomers = customers.filter(c => {
    const matchQuery = !q || (c.fullName || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? c.status : !c.status);
    return matchQuery && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const pagedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="admin-content-section fade-in">
      <div className="user-list-header">
        <div className="header-left">
          <h2 className="section-title">Quản lý khách hàng</h2>
          <div className="user-count">Tổng cộng: {customers.length} khách hàng</div>
        </div>
        <div className="header-right">
          <div className="filter-bar">
            <div className="search-box">
              <input className="search-input" placeholder="Tìm theo tên hoặc SĐT..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <span className="search-icon">🔍</span>
            </div>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng</option>
            </select>
          </div>
          <button className="btn-primary" onClick={onAdd}>Thêm khách hàng mới</button>
        </div>
      </div>
      <div className="user-table-container">
        {loading ? (
          <p>Đang tải danh sách khách hàng...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pagedCustomers.map((c) => (
                <tr key={c.customerId}>
                  <td>{c.customerId}</td>
                  <td>{c.fullName}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.createdAt || '-'}</td>
                  <td>
                    <span className={`status-badge ${c.status ? 'active' : 'inactive'}`}>
                      {c.status ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => onEdit(c)}>Sửa</button>
                      <button className="btn-danger" onClick={() => { setDeleteId(c.customerId); setConfirmOpen(true); }}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-data">Chưa có khách hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {filteredCustomers.length > 0 && (
        <div className="pagination">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>«</button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >{i + 1}</button>
          ))}
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>»</button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xóa khách hàng"
        message="Bạn có chắc muốn xóa khách hàng này? Hành động không thể hoàn tác."
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
        onConfirm={async () => { if (deleteId) { await handleDelete(deleteId); } setConfirmOpen(false); setDeleteId(null); }}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default CustomerList;
