import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    // Mock sign-in behaviour (replace with real auth)
    navigate('/purchase');
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-card">
        <div className="auth-illustration">
          <div className="illustration-placeholder" />
        </div>
        <div className="auth-form">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to Well Shoes</p>

          <div className="social-row">
            <button className="social-btn google">Sign in with Google</button>
            <button className="social-btn facebook">Sign in with Facebook</button>
          </div>

          <div className="divider"><span>or</span></div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
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
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="form-actions">
              <label className="remember">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/#forgot" className="forgot">Forgot?</Link>
            </div>

            <button className="primary-btn" type="submit">Sign In</button>
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


