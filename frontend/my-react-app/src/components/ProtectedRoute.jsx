import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user?.role) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== requiredRole) {
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
