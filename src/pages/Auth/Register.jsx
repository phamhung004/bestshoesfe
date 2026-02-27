import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './Login.css';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!agree) {
      setError('Bạn cần đồng ý với điều khoản dịch vụ.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.register({ fullName, email, password });
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) =>
    open ? (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );

  return (
    <div className="auth-page register-page">
      <div className="auth-card">

        {/* ── Left brand panel ── */}
        <div className="auth-brand">
          <div className="brand-dots" />
          <div className="brand-bg-letter">BS</div>

          <div className="brand-badge">
            <span className="brand-badge-dot" />
            <span className="brand-badge-label">JOIN THE SQUAD</span>
          </div>

          <div className="brand-headline">
            <h2>
              START YOUR
              <span className="accent">JOURNEY.</span>
            </h2>
            <p>Create your BestShoes account and get access to exclusive drops, member pricing, and personalised picks.</p>
          </div>

          <div className="brand-bar" />
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-form-panel">
          <div className="auth-head">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join BestShoes — it's free and takes 30 seconds</p>
          </div>

          {error && <div className="form-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span className="label">Full Name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </label>

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
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </label>

            <label className="field">
              <span className="label">Confirm Password</span>
              <div className="password-row">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label="Toggle confirm password visibility"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </label>

            <label className="terms">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              I agree to the <a href="/#terms">Terms of Service</a> and <a href="/#privacy">Privacy Policy</a>
            </label>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-foot">
            <span>Already have an account?</span>
            <Link to="/login" className="link">Sign in</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
