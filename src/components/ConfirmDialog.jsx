import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ open, title = 'Xác nhận', message, onConfirm, onCancel, confirmText = 'Xóa', cancelText = 'Hủy' }) => {
  if (!open) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-container">
        <div className="confirm-header">
          <h3 className="confirm-title">{title}</h3>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
