import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // If auth state is still loading (e.g. from local storage), we might want a loading spinner.
  // But PocketBase is synchronous with localStorage. 
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser?.is_admin) {
    // If they are logged in but not an admin, redirect them to the home page or a "Forbidden" page
    return <Navigate to="/" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default AdminRoute;
