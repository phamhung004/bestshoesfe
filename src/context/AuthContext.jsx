import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (storedToken || storedUser) {
      // Token missing or expired — clear stale data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = useCallback((authResponse) => {
    const { token, userId, email, role, fullName } = authResponse;
    const userData = { userId, email, role, fullName };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const userRole = user?.role ?? null;
  const isAdmin = isAuthenticated && userRole !== 'CUSTOMER';
  const isManager = isAdmin && ['ADMIN', 'MANAGER'].includes(userRole);
  const isFullAdmin = isAuthenticated && userRole === 'ADMIN';

  /** Check if the current user has one of the given roles */
  const hasRole = useCallback(
    (...roles) => isAuthenticated && roles.includes(userRole),
    [isAuthenticated, userRole]
  );

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, isAdmin, isManager, isFullAdmin, hasRole, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
