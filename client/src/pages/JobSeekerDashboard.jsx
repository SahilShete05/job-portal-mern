import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import RecentApplicationsTable from '../components/dashboard/RecentApplicationsTable';
import ApplicationsChart from '../components/dashboard/ApplicationsChart';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import { FileText, CheckCircle, XCircle, Briefcase, AlertCircle } from 'lucide-react';
import api from '../services/authService';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalApplications: 0,
      appliedCount: 0,
      shortlistedCount: 0,
      rejectedCount: 0,
    },
    recentApplications: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/dashboard/jobseeker');

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load dashboard');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleBrowseJobs = () => {
    navigate('/jobs');
  };

  const { statistics, recentApplications } = dashboardData;
  const hasNoApplications = statistics.totalApplications === 0;

  return (
    <div className="min-h-screen bg-app transition-colors duration-200">
      {/* Header */}
      <div className="bg-surface shadow-soft border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-primary">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted">
              Here's your job application overview
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && !loading && (
          <div
            className="rounded-lg p-4 mb-6 flex items-start gap-4 bg-danger-soft border border-danger-soft"
          >
            <AlertCircle className="flex-shrink-0 mt-0.5 text-danger" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger">
                Error loading dashboard
              </p>
              <p className="text-sm mt-1 text-danger">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="text-sm font-medium mt-3 px-4 py-2 rounded transition-colors duration-200 bg-danger-soft text-danger hover:brightness-110"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {hasNoApplications && !loading && !error && (
          <div
            className="rounded-lg p-12 text-center mb-8 bg-card border border-subtle shadow-card"
          >
            <Briefcase size={48} className="mx-auto mb-4 text-muted" />
            <h3 className="text-xl font-semibold mb-2 text-primary">
              No applications yet
            </h3>
            <p className="mb-6 text-muted">
              Start your job search journey by applying to positions that match your skills and interests.
            </p>
            <button
              onClick={handleBrowseJobs}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--app-accent)] text-white font-medium rounded-lg hover:brightness-110 transition-colors duration-200"
            >
              <Briefcase size={18} />
              Browse Jobs
            </button>
          </div>
        )}

        {/* Stats Grid */}
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Applications"
              value={statistics.totalApplications}
              icon={FileText}
              color="blue"
              isLoading={loading}
            />
            <StatCard
              label="Shortlisted"
              value={statistics.shortlistedCount}
              icon={CheckCircle}
              color="green"
              isLoading={loading}
            />
            <StatCard
              label="Rejected"
              value={statistics.rejectedCount}
              icon={XCircle}
              color="red"
              isLoading={loading}
            />
            <StatCard
              label="In Progress"
              value={statistics.appliedCount}
              icon={Briefcase}
              color="purple"
              isLoading={loading}
            />
          </div>
        )}

        {/* Chart */}
        <div className="mb-8">
          <ApplicationsChart
            applications={recentApplications}
            isLoading={loading}
          />
        </div>

        {/* Recent Applications Table */}
        <div>
          <h2
            className="text-xl font-bold mb-4 text-primary"
          >
            Recent Applications
          </h2>
          <RecentApplicationsTable
            applications={recentApplications}
            isLoading={loading}
            error={error && !loading ? error : null}
          />
        </div>

        {/* CTA Section for Browse Jobs */}
        {hasNoApplications && !loading && !error && (
          <div
            className="mt-8 rounded-lg p-8 text-center bg-card border border-subtle shadow-card"
          >
            <h3 className="text-lg font-semibold mb-2 text-primary">
              Ready to find your next opportunity?
            </h3>
            <p className="mb-4 text-muted">
              Browse our job listings and submit your applications to get started.
            </p>
            <button
              onClick={handleBrowseJobs}
              className="px-6 py-2 bg-[color:var(--app-accent)] text-white font-medium rounded-lg hover:brightness-110 transition-colors duration-200"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
