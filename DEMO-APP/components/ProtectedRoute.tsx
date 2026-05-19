import React from 'react';
import { Navigate } from 'react-router-dom';
import { useData } from '../context';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated } = useData();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required and user doesn't have them
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to home if unauthorized for this specific page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;