import React, { useEffect, useState } from 'react';
import { customerAPI } from '../../../../services/api';
import { useParams } from 'react-router-dom';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await customerAPI.getById(id);
        setCustomer(data);
      } catch (e) {
        setError('Không tải được chi tiết khách hàng');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!customer) return <p>Không có dữ liệu</p>;

  return (
    <div className="admin-content-section">
      <h2 className="section-title">Chi tiết khách hàng #{customer.customerId}</h2>
      <div className="detail-grid">
        <div><strong>Họ tên:</strong> {customer.fullName}</div>
        <div><strong>Email:</strong> {customer.email}</div>
        <div><strong>SĐT:</strong> {customer.phone}</div>
        <div><strong>Giới tính:</strong> {customer.gender}</div>
        <div><strong>Trạng thái:</strong> {customer.status ? 'Hoạt động' : 'Ngừng'}</div>
        <div><strong>Ngày tạo:</strong> {customer.createdAt || '-'}</div>
      </div>
    </div>
  );
};

export default CustomerDetail;
