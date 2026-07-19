import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090d]">
        <div className="relative flex items-center justify-center">
          {/* Glowing pulse rings */}
          <div className="absolute w-16 h-16 bg-primary-500 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute w-12 h-12 bg-accent-cyan rounded-full opacity-30 animate-pulse"></div>
          {/* Main loader */}
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400 font-medium text-sm animate-pulse">
          Securing session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
