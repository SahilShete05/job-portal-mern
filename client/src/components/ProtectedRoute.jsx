import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, requireAuth = true }) => {
  const { user, loading, isRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && user && !isRole(requiredRole)) {
    const roleDestination = user.role === 'employer' ? '/employer/profile' : '/profile';
    const roleLabel = requiredRole === 'employer' ? 'employers' : 'job seekers';
    const destinationLabel = user.role === 'employer' ? 'Company Profile' : 'Profile';

    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-center animate-fade-in max-w-md">
          <h1 className="text-4xl font-bold text-primary mb-4">Access Restricted</h1>
          <p className="text-muted mb-3">
            This page is only available to {roleLabel}. You are currently signed in as a {user.role}.
          </p>
          <p className="text-muted mb-6">
            Use the correct profile page or return to jobs.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to={roleDestination}
              className="text-white bg-[color:var(--app-accent)] hover:brightness-110 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Go to {destinationLabel}
            </Link>
            <Link to="/jobs" className="text-[color:var(--app-accent)] font-semibold hover:underline">
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
