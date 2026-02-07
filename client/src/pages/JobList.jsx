import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import JobCard from '../components/JobCard';
import { getJobs } from '../services/jobService';
import { applyJob, getMyApplications } from '../services/applicationService';
import { useSavedJobs } from '../hooks/useSavedJobs';

const JobList = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
  });
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [pagination, setPagination] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const { isSaved, toggleSaved } = useSavedJobs();

  const uniqueJobs = useMemo(() => {
    const map = new Map();
    (jobs || []).forEach((job) => {
      if (job?._id && !map.has(job._id)) {
        map.set(job._id, job);
      }
    });
    return Array.from(map.values());
  }, [jobs]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getJobs({
        title: filters.title,
        location: filters.location,
        jobType: filters.jobType,
        page,
        limit: 12,
      });
      setJobs(result.jobs);
      setPagination(result.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setFilters({
      title: searchParams.get('title') || '',
      location: searchParams.get('location') || '',
      jobType: searchParams.get('jobType') || '',
    });
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user || user.role !== 'jobseeker') {
        setAppliedJobs([]);
        return;
      }

      try {
        const response = await getMyApplications();
        const appliedIds = (response.applications || [])
          .map((application) => application?.job?._id)
          .filter(Boolean);
        setAppliedJobs(appliedIds);
      } catch (err) {
        console.error('Failed to load applications:', err);
      }
    };

    fetchAppliedJobs();
  }, [user]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }, []);

  useEffect(() => {
    const params = {};
    if (filters.title) params.title = filters.title;
    if (filters.location) params.location = filters.location;
    if (filters.jobType) params.jobType = filters.jobType;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  const handleApply = useCallback(async (jobId) => {
    if (!user) {
      setFeedback({ type: 'error', message: 'Please login to apply for jobs.' });
      return;
    }

    if (user.role !== 'jobseeker') {
      setFeedback({ type: 'error', message: 'Only job seekers can apply for jobs.' });
      return;
    }

    try {
      await applyJob(jobId);
      setAppliedJobs((prev) => [...prev, jobId]);
      setFeedback({ type: 'success', message: 'Application submitted successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app transition-colors duration-300 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-primary mb-2">Browse Jobs</h1>
          <p className="text-muted">Find your next opportunity</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-subtle rounded-2xl shadow-soft p-6 mb-8 animate-fade-in transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title Search */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Search by Title
              </label>
              <input
                type="text"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                placeholder="e.g., React Developer"
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-surface text-primary focus:outline-none focus:ring-2 ring-accent focus:border-[color:var(--app-accent)] transition-all duration-200"
              />
            </div>

            {/* Location Search */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="e.g., New York"
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-surface text-primary focus:outline-none focus:ring-2 ring-accent focus:border-[color:var(--app-accent)] transition-all duration-200"
              />
            </div>

            {/* Job Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Job Type
              </label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 rounded-lg border border-subtle bg-surface text-primary focus:outline-none focus:ring-2 ring-accent focus:border-[color:var(--app-accent)] transition-all duration-200"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-soft border border-danger-soft rounded-lg animate-fade-in">
            <p className="text-danger font-semibold">{error}</p>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-lg border animate-fade-in flex items-start justify-between gap-4 ${
              feedback.type === 'success'
                ? 'bg-success-soft border-success-soft'
                : 'bg-danger-soft border-danger-soft'
            }`}
          >
            <p
              className={`font-semibold ${
                feedback.type === 'success'
                  ? 'text-success'
                  : 'text-danger'
              }`}
            >
              {feedback.message}
            </p>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className={`text-sm font-medium ${
                feedback.type === 'success'
                  ? 'text-success'
                  : 'text-danger'
              }`}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
          </div>
        ) : uniqueJobs.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-muted text-lg">No jobs found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={() => handleApply(job._id)}
                onView={() => navigate(`/jobs/${job._id}`)}
                isApplied={appliedJobs.includes(job._id)}
                isSaved={isSaved(job._id)}
                onToggleSave={() => toggleSaved(job._id)}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && uniqueJobs.length > 0 && pagination && (
          <div className="flex items-center justify-between mt-10 text-sm text-muted">
            <p>
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={pagination.page <= 1}
                className="px-4 py-2 rounded-lg border border-subtle bg-surface text-primary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 rounded-lg border border-subtle bg-surface text-primary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
