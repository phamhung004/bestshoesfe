import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './Login.css';

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.data);
      const from = location.state?.from?.pathname;
      if (response.data.role !== 'CUSTOMER') {
        navigate('/admin');
      } else {
        navigate(from || '/');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-card">

        {/* ── Left brand panel ── */}
        <div className="auth-brand">
          <div className="brand-dots" />
          <div className="brand-bg-letter">BS</div>

          <div className="brand-badge">
            <span className="brand-badge-dot" />
            <span className="brand-badge-label">BESTSHOES PREMIUM</span>
          </div>

          <div className="brand-headline">
            <h2>
              WELCOME
              <span className="accent">BACK.</span>
            </h2>
            <p>Sign in to unlock exclusive drops, track your orders, and access member-only deals.</p>
          </div>

          <div className="brand-bar" />
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-form-panel">
          <div className="auth-head">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Continue to your BestShoes account</p>
          </div>

          {error && <div className="form-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span className="label">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <div className="password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>

            <div className="form-actions">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/#forgot" className="forgot">Forgot password?</Link>
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-foot">
            <span>Don't have an account?</span>
            <Link to="/register" className="link">Create account</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
