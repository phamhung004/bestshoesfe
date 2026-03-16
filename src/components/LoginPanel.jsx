import React from 'react';
import './LoginPanel.css';

const LoginPanel = () => {
  return (
    <div className="login-panel">
      {/* Illustration */}
      <div className="login-illustration">
        <div className="illustration-placeholder"></div>
      </div>

      {/* Login Content */}
      <div className="login-content">
        <h2 className="login-title">
          Đăng nhập<br />
          để mua hàng
        </h2>

        <button className="login-button">
          <span className="login-button-text">Đăng nhập</span>
        </button>

        <p className="login-description">
          Đăng nhập để nhận ưu đãi và nhiều quyền lợi khác từ BestShoes.
        </p>
      </div>
    </div>
  );
};

export default LoginPanel;
