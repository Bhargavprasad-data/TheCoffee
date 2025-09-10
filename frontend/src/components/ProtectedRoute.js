import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (requireAdmin && !user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;