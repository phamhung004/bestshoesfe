import React, { useEffect, useState } from 'react';
import { customerAPI } from '../../../../services/api';
import '../PromotionForm.css';

const emptyCustomer = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  gender: '',
  status: true,
};

const CustomerForm = ({ customer, onSave, onCancel, isEditing }) => {
  const [form, setForm] = useState(customer || emptyCustomer);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(customer || emptyCustomer); }, [customer]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && customer?.customerId) {
        await customerAPI.update(customer.customerId, form);
      } else {
        await customerAPI.create(form);
      }
      onSave?.();
    } catch (err) {
      alert('Lưu thất bại');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="promotion-form-overlay">
      <div className="promotion-form-container">
        <div className="promotion-form-header">
          <h2 className="form-title">{isEditing ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</h2>
          <button onClick={onCancel} className="btn-close">✕</button>
        </div>

        <form onSubmit={submit} className="promotion-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Họ tên</label>
              <input className="form-input" name="fullName" value={form.fullName} onChange={change} placeholder="Ví dụ: Nguyễn Văn A" required />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Email</label>
              <input className="form-input" name="email" value={form.email} onChange={change} placeholder="ví dụ: user@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input className="form-input" name="password" type="password" value={form.password} onChange={change} placeholder="Nhập mật khẩu" />
            </div>

            <div className="form-group">
              <label className="form-label">SĐT</label>
              <input className="form-input" name="phone" value={form.phone} onChange={change} placeholder="Ví dụ: 0901234567" />
            </div>

            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select className="form-input" name="gender" value={form.gender || ''} onChange={change}>
                <option value="">--</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <label className="form-label">Hoạt động</label>
              <input type="checkbox" name="status" checked={!!form.status} onChange={change} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
