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
          Login<br />
          to purchase
        </h2>

        <button className="login-button">
          <span className="login-button-text">Login</span>
        </button>

        <p className="login-description">
          Get to reedem voucher from discont by WellShoes and get other benefit.
        </p>
      </div>
    </div>
  );
};

export default LoginPanel;
