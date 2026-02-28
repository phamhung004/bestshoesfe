import React, { useState } from 'react';
import { Lock, Unlock, Trash2 } from 'lucide-react';

const LockUnlockModal = ({ type, account, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  if (!type || !account) return null;

  // type: 'lock' | 'unlock' | 'delete'
  const isLock = type === 'lock';
  const isUnlock = type === 'unlock';
  const isDelete = type === 'delete';

  const name = account.fullName;
  const email = account.email;
  const deleteReady = confirmEmail === email;

  const handleConfirm = () => {
    onConfirm({ reason, confirmEmail });
  };

  return (
    <div className="am-modal-backdrop" onClick={onClose}>
      <div className="am-modal" onClick={(e) => e.stopPropagation()}>
        <div className="am-modal-body">
          {/* Icon */}
          {isLock && (
            <div className="am-modal-icon red"><Lock size={24} /></div>
          )}
          {isUnlock && (
            <div className="am-modal-icon green"><Unlock size={24} /></div>
          )}
          {isDelete && (
            <div className="am-modal-icon red"><Trash2 size={24} /></div>
          )}

          {/* Title */}
          {isLock && <h3 className="am-modal-title red">Khóa tài khoản</h3>}
          {isUnlock && <h3 className="am-modal-title green">Mở khóa tài khoản</h3>}
          {isDelete && <h3 className="am-modal-title red">Xóa nhân viên</h3>}

          {/* Body text */}
          {isLock && (
            <p className="am-modal-text">
              Bạn có chắc muốn khóa tài khoản của <strong>{name}</strong>?
              Họ sẽ không thể đăng nhập cho đến khi được mở khóa.
            </p>
          )}
          {isUnlock && (
            <p className="am-modal-text">
              Tài khoản <strong>{name}</strong> sẽ được mở khóa và có thể đăng nhập trở lại.
            </p>
          )}
          {isDelete && (
            <p className="am-modal-text">
              Hành động này không thể hoàn tác. Tài khoản của <strong>{name}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </p>
          )}

          {/* Lock reason textarea */}
          {isLock && (
            <textarea
              className="am-modal-textarea"
              placeholder="Nhập lý do khóa tài khoản (không bắt buộc)"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}

          {/* Delete type-to-confirm */}
          {isDelete && (
            <>
              <p className="am-modal-confirm-label">
                Nhập email <strong>{email}</strong> để xác nhận:
              </p>
              <input
                className="am-modal-input"
                type="text"
                placeholder={email}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="am-modal-footer">
          <button className="am-btn am-btn-ghost" onClick={onClose}>Hủy</button>
          {isLock && (
            <button className="am-btn am-btn-danger" onClick={handleConfirm}>
              Xác nhận khóa
            </button>
          )}
          {isUnlock && (
            <button
              className="am-btn"
              style={{ background: '#16a34a', color: '#fff', border: '1px solid #16a34a', fontWeight: 600 }}
              onClick={handleConfirm}
            >
              Xác nhận mở khóa
            </button>
          )}
          {isDelete && (
            <button
              className="am-btn am-btn-danger"
              disabled={!deleteReady}
              style={{ opacity: deleteReady ? 1 : 0.5 }}
              onClick={handleConfirm}
            >
              Xóa nhân viên
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockUnlockModal;
