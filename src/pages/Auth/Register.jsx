import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) {
      setError('Please fill all required fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!agree) {
      setError('You must agree to the terms.');
      return;
    }
    navigate('/login');
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

          <div className="social-row">
            <button className="social-btn google" type="button">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#DB4437" d="M12 5c1.6 0 3 .6 4.1 1.5L19.3 3.3C17.4 1.3 14.8 0 12 0 7.4 0 3.5 2.7 1.5 6.6l3.8 2.9C6.3 6.9 8.9 5 12 5z"/>
                <path fill="#F4B400" d="M23.5 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.3 3.5l3.6 2.8c2.1-2 3.7-5 3.7-8.4z"/>
                <path fill="#0F9D58" d="M5.3 14.5C5.1 13.7 5 12.9 5 12s.1-1.7.3-2.5L1.5 6.6C.5 8.5 0 10.2 0 12c0 1.8.5 3.5 1.5 5l3.8-2.5z"/>
                <path fill="#DB4437" d="M12 24c2.7 0 5-.9 6.8-2.4l-3.6-2.8c-1 .7-2.2 1.1-3.2 1.1-3.1 0-5.7-2-6.7-4.8L1.5 17.6C3.5 21.3 7.4 24 12 24z"/>
              </svg>
              Google
            </button>
            <button className="social-btn facebook" type="button">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97H15.8c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="divider">or</div>

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

            <button className="primary-btn" type="submit">Create Account</button>
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
