import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'mentor' | 'mentee' | 'both';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login/mentor" />;
  }

  if (allowedRole === 'both') {
    return <>{children}</>;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={`/login/${allowedRole}`} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 