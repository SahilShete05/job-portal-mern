import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import RecentJobsTable from '../components/dashboard/RecentJobsTable';
import RecentApplicationsForEmployer from '../components/dashboard/RecentApplicationsForEmployer';
import { Briefcase, Users, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import api from '../services/authService';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    jobStatistics: {
      totalJobs: 0,
      activeJobs: 0,
      inactiveJobs: 0,
    },
    applicationStatistics: {
      totalApplications: 0,
      appliedCount: 0,
      shortlistedCount: 0,
      rejectedCount: 0,
    },
    recentJobs: [],
    recentApplications: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/dashboard/employer');

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

  const handlePostJob = () => {
    navigate('/post-job');
  };

  const handleViewApplicants = (job) => {
    if (!job?._id) return;
    navigate(`/employer/jobs/${job._id}/applicants`);
  };

  const { jobStatistics, applicationStatistics, recentJobs, recentApplications } =
    dashboardData;
  const hasNoJobs = jobStatistics.totalJobs === 0;

  return (
    <div className="min-h-screen bg-app transition-colors duration-200">
      {/* Header */}
      <div className="bg-surface shadow-soft border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-primary">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-muted">
                Here's your recruitment overview
              </p>
            </div>
            <button
              onClick={handlePostJob}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--app-accent)] text-white font-medium rounded-lg hover:brightness-110 transition-colors duration-200 w-fit"
            >
              <Plus size={18} />
              Post Job
            </button>
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
        {hasNoJobs && !loading && !error && (
          <div
            className="rounded-lg p-12 text-center mb-8 bg-card border border-subtle shadow-card"
          >
            <Briefcase size={48} className="mx-auto mb-4 text-muted" />
            <h3 className="text-xl font-semibold mb-2 text-primary">
              No jobs posted yet
            </h3>
            <p className="mb-6 text-muted">
              Start recruiting by posting your first job opening.
            </p>
            <button
              onClick={handlePostJob}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--app-accent)] text-white font-medium rounded-lg hover:brightness-110 transition-colors duration-200"
            >
              <Plus size={18} />
              Post Your First Job
            </button>
          </div>
        )}

        {/* Job Statistics Cards */}
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Jobs Posted"
              value={jobStatistics.totalJobs}
              icon={Briefcase}
              color="blue"
              isLoading={loading}
            />
            <StatCard
              label="Total Applications"
              value={applicationStatistics.totalApplications}
              icon={Users}
              color="purple"
              isLoading={loading}
            />
            <StatCard
              label="Shortlisted"
              value={applicationStatistics.shortlistedCount}
              icon={CheckCircle}
              color="green"
              isLoading={loading}
            />
            <StatCard
              label="Rejected"
              value={applicationStatistics.rejectedCount}
              icon={XCircle}
              color="red"
              isLoading={loading}
            />
          </div>
        )}

        {/* Recent Jobs Table */}
        <div className="mb-8">
          <h2
            className="text-xl font-bold mb-4 text-primary"
          >
            Recent Jobs Posted
          </h2>
          <RecentJobsTable
            jobs={recentJobs}
            isLoading={loading}
            error={error && !loading ? error : null}
            onViewApplicants={handleViewApplicants}
          />
        </div>

        {/* Recent Applications Table */}
        <div className="mb-8">
          <h2
            className="text-xl font-bold mb-4 text-primary"
          >
            Recent Applications
          </h2>
          <RecentApplicationsForEmployer
            applications={recentApplications}
            isLoading={loading}
            error={error && !loading ? error : null}
          />
        </div>

        {/* CTA Section for Post Job */}
        {hasNoJobs && !loading && !error && (
          <div
            className="rounded-lg p-8 text-center bg-card border border-subtle shadow-card"
          >
            <h3 className="text-lg font-semibold mb-2 text-primary">
              Ready to start hiring?
            </h3>
            <p className="mb-4 text-muted">
              Post a job opening to attract qualified candidates.
            </p>
            <button
              onClick={handlePostJob}
              className="px-6 py-2 bg-[color:var(--app-accent)] text-white font-medium rounded-lg hover:brightness-110 transition-colors duration-200"
            >
              Post a Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
