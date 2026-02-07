import React from 'react';
import StatusBadge from './StatusBadge';
import SkeletonLoader from './SkeletonLoader';

const RecentApplicationsTable = ({ applications = [], isLoading = false, error = null }) => {
  if (isLoading) {
    return (
      <div className="rounded-lg overflow-hidden bg-card border border-subtle shadow-card">
        <table className="w-full">
          <thead className="bg-[color:var(--app-surface)]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Job Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Applied Date</th>
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

  if (!applications || applications.length === 0) {
    return (
      <div className="rounded-lg p-12 text-center bg-card border border-subtle shadow-card">
        <p className="text-lg font-semibold mb-2 text-primary">
          No applications yet
        </p>
        <p className="text-muted">
          Start applying to jobs to see your application history here.
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
                Company
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-primary"
              >
                Status
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-primary"
              >
                Applied Date
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr
                key={app._id || index}
                className="border-b border-subtle transition-colors duration-200 hover:bg-[color:var(--app-accent-soft)]"
              >
                <td
                  className="px-6 py-4 text-sm font-medium text-primary"
                >
                  {app.jobTitle}
                </td>
                <td
                  className="px-6 py-4 text-sm text-muted"
                >
                  {app.companyName}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>
                <td
                  className="px-6 py-4 text-sm text-muted"
                >
                  {formatDate(app.appliedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentApplicationsTable;
