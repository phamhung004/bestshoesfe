import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
    // Mock register
    navigate('/login');
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-card">
        <div className="auth-illustration">
          <div className="illustration-placeholder" />
        </div>
        <div className="auth-form">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join Well Shoes for exclusive offers</p>

          <div className="social-row">
            <button className="social-btn google">Continue with Google</button>
            <button className="social-btn facebook">Continue with Facebook</button>
          </div>

          <div className="divider"><span>or</span></div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span className="label">Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="field">
              <span className="label">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="field">
              <span className="label">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
            </label>
            <label className="field">
              <span className="label">Confirm password</span>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" />
            </label>

            <label className="terms">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the <a href="/#terms">terms</a>
            </label>

            <button className="primary-btn" type="submit">Create account</button>
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


