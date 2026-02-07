import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const RecentJobsTable = ({ jobs = [], isLoading = false, error = null, onViewApplicants = null }) => {
  if (isLoading) {
    return (
      <div className="rounded-lg overflow-hidden bg-card border border-subtle shadow-card">
        <table className="w-full">
          <thead className="bg-[color:var(--app-surface)]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Job Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Posted Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Applicants</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonLoader count={5} type="table-row" />
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg p-6 text-center bg-card border border-subtle shadow-card">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-lg p-12 text-center bg-card border border-subtle shadow-card">
        <p className="text-lg font-semibold mb-2 text-primary">
          No jobs posted yet
        </p>
        <p className="text-muted">
          Start posting jobs to see them listed here.
        </p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusDisplay = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-success-soft text-success border border-success-soft'
      : 'bg-danger-soft text-danger border border-danger-soft';
  };

  return (
    <div className="rounded-lg overflow-hidden bg-card border border-subtle shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[color:var(--app-surface)]">
            <tr className="border-b border-subtle">
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-primary"
              >
                Job Title
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-primary"
              >
                Status
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-primary"
              >
                Posted Date
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-primary"
              >
                Applicants
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr
                key={job._id || index}
                className="border-b border-subtle transition-colors duration-200 hover:bg-[color:var(--app-accent-soft)]"
              >
                <td
                  className="px-6 py-4 text-sm font-medium text-primary"
                >
                  {job.title}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      job.isActive
                    )}`}
                  >
                    {getStatusDisplay(job.isActive)}
                  </span>
                </td>
                <td
                  className="px-6 py-4 text-sm text-muted"
                >
                  {formatDate(job.createdAt)}
                </td>
                <td className="px-6 py-4">
                  {onViewApplicants ? (
                    <button
                      type="button"
                      onClick={() => onViewApplicants(job)}
                      className="text-sm font-semibold text-[color:var(--app-accent)] hover:underline"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentJobsTable;
