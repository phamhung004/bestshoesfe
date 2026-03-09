import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @param {Object} props
 * @param {boolean}  [props.requireAdmin]  - Require any admin role (ADMIN / MANAGER / STAFF)
 * @param {string[]} [props.allowedRoles]  - Restrict to specific roles, e.g. ['ADMIN','MANAGER']
 */
const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = [] }) => {
  const { isAuthenticated, isAdmin, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
