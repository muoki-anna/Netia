import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LOGIN_PATH } from '@/config/subscriptionRoutes';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
