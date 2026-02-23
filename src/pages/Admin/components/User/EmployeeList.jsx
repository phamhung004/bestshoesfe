import React, { useEffect, useState } from 'react';
import { employeeAPI } from '../../../../services/api';
import './UserList.css';
import ConfirmDialog from '../../../../components/ConfirmDialog.jsx';

const EmployeeList = ({ onAdd, onEdit }) => {
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeAPI.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Không tải được danh sách nhân viên');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const departmentOptions = ['ALL', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  const handleDelete = async (id) => {
    if (!confirm('Xóa nhân viên này?')) return;
    try {
      await employeeAPI.delete(id);
      await load();
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  // Pagination helpers
  const pageSize = 8;
  const q = query.trim().toLowerCase();
  const filteredEmployees = employees.filter(e => {
    const matchQuery = !q || (e.employeeCode || '').toLowerCase().includes(q) || (e.position || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? e.status : !e.status);
    const matchDept = departmentFilter === 'ALL' || (e.department === departmentFilter);
    return matchQuery && matchStatus && matchDept;
  });
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const pagedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="admin-content-section fade-in">
      <div className="user-list-header">
        <div className="header-left">
          <h2 className="section-title">Quản lý nhân viên</h2>
          <div className="user-count">Tổng cộng: {employees.length} nhân viên</div>
        </div>
        <div className="header-right">
          <div className="filter-bar">
            <div className="search-box">
              <input className="search-input" placeholder="Tìm theo mã hoặc tên..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <span className="search-icon">🔍</span>
            </div>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng</option>
            </select>
            <select className="filter-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              {departmentOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'ALL' ? 'Tất cả phòng ban' : opt}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={onAdd}>Thêm nhân viên mới</button>
        </div>
      </div>
      <div className="user-table-container">
        {loading ? (
          <p>Đang tải danh sách nhân viên...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã NV</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Lương</th>
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pagedEmployees.map((e) => (
                <tr key={e.employeeId}>
                  <td>{e.employeeId}</td>
                  <td>{e.employeeCode}</td>
                  <td>{e.department}</td>
                  <td>{e.position}</td>
                  <td>{e.salary}</td>
                  <td>{e.role?.roleName || '-'}</td>
                  <td>{e.createdAt || '-'}</td>
                  <td>
                    <span className={`status-badge ${e.status ? 'active' : 'inactive'}`}>
                      {e.status ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => onEdit(e)}>Sửa</button>
                      <button className="btn-danger" onClick={() => { setDeleteId(e.employeeId); setConfirmOpen(true); }}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="9" className="no-data">Chưa có nhân viên nào</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {filteredEmployees.length > 0 && (
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
        title="Xác nhận xóa nhân viên"
        message="Bạn có chắc muốn xóa nhân viên này? Hành động không thể hoàn tác."
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
        onConfirm={async () => { if (deleteId) { await handleDelete(deleteId); } setConfirmOpen(false); setDeleteId(null); }}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default EmployeeList;
