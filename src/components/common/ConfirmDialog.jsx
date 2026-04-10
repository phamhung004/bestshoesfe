import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({
  open,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn tiếp tục?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary', // primary | danger
  align = 'center', // center | right
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className={`cf-overlay ${align === 'right' ? 'cf-overlay-right' : ''}`} onClick={onCancel}>
      <div className="cf-hotspot-blocker" onClick={(e) => e.stopPropagation()} />
      <div className="cf-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="cf-title">{title}</h3>
        <p className="cf-message">{message}</p>

        <div className="cf-actions">
          <button type="button" className="cf-btn cf-btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`cf-btn ${variant === 'danger' ? 'cf-btn-danger' : 'cf-btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
