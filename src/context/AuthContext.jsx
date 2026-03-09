import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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
