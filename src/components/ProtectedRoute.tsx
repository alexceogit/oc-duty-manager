// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { state, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to initialize
    if (!state.initialized) return;

    // Not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Role check
    if (requiredRole === 'admin' && !isAdmin) {
      navigate('/', { replace: true });
      return;
    }
  }, [state.initialized, isAuthenticated, isAdmin, navigate, requiredRole]);

  // Show loading while initializing
  if (!state.initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated, render children
  return <>{children}</>;
}
