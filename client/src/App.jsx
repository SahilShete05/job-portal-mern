import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
// Pages (lazy-loaded)
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const JobList = React.lazy(() => import('./pages/JobList'));
const JobDetail = React.lazy(() => import('./pages/JobDetail'));
const JobSeekerDashboard = React.lazy(() => import('./pages/JobSeekerDashboard'));
const JobSeekerProfile = React.lazy(() => import('./pages/JobSeekerProfile'));
const AppliedJobs = React.lazy(() => import('./pages/AppliedJobs'));
const SavedJobs = React.lazy(() => import('./pages/SavedJobs'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Interviews = React.lazy(() => import('./pages/Interviews'));
const MyJobs = React.lazy(() => import('./pages/MyJobs'));
const EmployerDashboard = React.lazy(() => import('./pages/EmployerDashboard'));
const PostJob = React.lazy(() => import('./pages/PostJob'));
const EmployerProfile = React.lazy(() => import('./pages/EmployerProfile'));
const EmployerApplicants = React.lazy(() => import('./pages/EmployerApplicants'));
const Settings = React.lazy(() => import('./pages/Settings'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-app flex items-center justify-center">
    <div className="animate-spin h-10 w-10 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full" />
  </div>
);

// Dashboard Router - Routes based on user role
const Dashboard = React.memo(() => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'employer') {
    return <EmployerDashboard />;
  }

  return <JobSeekerDashboard />;
});

Dashboard.displayName = 'Dashboard';

// AppRoutes Component
const AppRoutes = React.memo(() => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public - Job List (no auth required) */}
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Protected Routes - Dashboard (role-based) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Job Seeker Dashboard - jobseeker only */}
        <Route
          path="/dashboard/jobseeker"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="jobseeker">
              <JobSeekerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Job Seeker Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="jobseeker">
              <JobSeekerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applied-jobs"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="jobseeker">
              <AppliedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="jobseeker">
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute requireAuth={true}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute requireAuth={true}>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interviews"
          element={
            <ProtectedRoute requireAuth={true}>
              <Interviews />
            </ProtectedRoute>
          }
        />

        {/* Employer Dashboard - employer only */}
        <Route
          path="/dashboard/employer"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/jobs/:jobId/applicants"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="employer">
              <EmployerApplicants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="employer">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="employer">
              <MyJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/profile"
          element={
            <ProtectedRoute requireAuth={true} requiredRole="employer">
              <EmployerProfile />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
});

AppRoutes.displayName = 'AppRoutes';

// Main App Component
function App() {
  return (
    <DarkModeProvider>
      <Router>
        <AuthProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </AuthProvider>
      </Router>
    </DarkModeProvider>
  );
}

export default App;


