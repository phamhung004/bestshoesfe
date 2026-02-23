import React, { useEffect, useState } from 'react';
import { employeeAPI } from '../../../../services/api';
import { useParams } from 'react-router-dom';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await employeeAPI.getById(id);
        setEmployee(data);
      } catch (e) {
        setError('Không tải được chi tiết nhân viên');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!employee) return <p>Không có dữ liệu</p>;

  return (
    <div className="admin-content-section">
      <h2 className="section-title">Chi tiết nhân viên #{employee.employeeId}</h2>
      <div className="detail-grid">
        <div><strong>Mã NV:</strong> {employee.employeeCode}</div>
        <div><strong>Phòng ban:</strong> {employee.department}</div>
        <div><strong>Chức vụ:</strong> {employee.position}</div>
        <div><strong>Lương:</strong> {employee.salary}</div>
        <div><strong>Role:</strong> {employee.role?.roleName}</div>
        <div><strong>Trạng thái:</strong> {employee.status ? 'Hoạt động' : 'Ngừng'}</div>
        <div><strong>Ngày tạo:</strong> {employee.createdAt || '-'}</div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
