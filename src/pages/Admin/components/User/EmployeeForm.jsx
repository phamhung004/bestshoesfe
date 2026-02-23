import React, { useEffect, useState } from 'react';
import { employeeAPI, roleAPI } from '../../../../services/api';
import '../PromotionForm.css';

const emptyEmployee = {
  employeeCode: '',
  position: '',
  department: '',
  salary: null,
  roleId: null,
  status: true,
};

const EmployeeForm = ({ employee, onSave, onCancel, isEditing }) => {
  const [form, setForm] = useState(employee || emptyEmployee);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => { setForm(employee || emptyEmployee); }, [employee]);
  useEffect(() => {
    // load role options
    roleAPI.getAll().then((data) => {
      setRoles(Array.isArray(data) ? data : []);
    }).catch(() => setRoles([]));
  }, []);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.salary !== null && payload.salary !== '') payload.salary = Number(payload.salary);
      if (payload.roleId !== null && payload.roleId !== '') payload.roleId = Number(payload.roleId);

      if (isEditing && employee?.employeeId) {
        await employeeAPI.update(employee.employeeId, payload);
      } else {
        await employeeAPI.create(payload);
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
          <h2 className="form-title">{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
          <button onClick={onCancel} className="btn-close">✕</button>
        </div>

        <form onSubmit={submit} className="promotion-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mã NV</label>
              <input className="form-input" name="employeeCode" value={form.employeeCode} onChange={change} placeholder="Để trống để tự sinh mã EMPxxxxxx" />
            </div>
            <div className="form-group">
              <label className="form-label">Phòng ban</label>
              <input className="form-input" name="department" value={form.department} onChange={change} placeholder="Ví dụ: Sales, IT, HR" />
            </div>
            <div className="form-group">
              <label className="form-label">Chức vụ</label>
              <input className="form-input" name="position" value={form.position} onChange={change} placeholder="Ví dụ: Manager, Staff" />
            </div>
            <div className="form-group">
              <label className="form-label">Lương</label>
              <input className="form-input" name="salary" type="number" step="0.01" value={form.salary ?? ''} onChange={change} placeholder="Ví dụ: 12000000" />
            </div>
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select className="form-input" name="roleId" value={form.roleId ?? ''} onChange={change}>
                <option value="">Chọn vai trò...</option>
                {roles.map(r => (
                  <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                ))}
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

export default EmployeeForm;
