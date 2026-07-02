import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ 
  isAuthLoading, 
  isLoggedIn, 
  children, 
  portalName = 'this area', 
  loginRoute = '/login' 
}) {
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={loginRoute} replace />;
  }

  return children;
}
