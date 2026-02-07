import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedTable from '../components/common/EnhancedTable';
import StatusTimeline from '../components/common/StatusTimeline';
import StatusBadge from '../components/dashboard/StatusBadge';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import { getMyApplications, withdrawApplication } from '../services/applicationService';
import Button from '../components/Button';

const AppliedJobs = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getMyApplications();
        setApplications(response.applications || []);
      } catch (err) {
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((app) => app.status === 'applied').length;
    const interview = applications.filter((app) => app.status === 'interview').length;
    const offered = applications.filter((app) => app.status === 'offered').length;
    const hired = applications.filter((app) => app.status === 'hired').length;
    const rejected = applications.filter((app) => ['rejected', 'withdrawn', 'closed'].includes(app.status)).length;
    return { total, applied, interview, offered, hired, rejected };
  }, [applications]);

  const columns = [
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'company', label: 'Company' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <div className="space-y-1">
          <StatusBadge status={value} />
          <StatusTimeline status={value} />
        </div>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => row.jobId && navigate(`/jobs/${row.jobId}`)}
          >
            View Job
          </Button>
          {row.canWithdraw && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => row.onWithdraw?.()}
            >
              Withdraw
            </Button>
          )}
        </div>
      ),
    },
  ];

  const rows = applications.map((application) => ({
    id: application._id,
    jobTitle: application.job?.title || 'Untitled role',
    company: application.job?.companyName || 'Company',
    status: application.status,
    appliedAt: application.appliedAt,
    jobId: application.job?._id,
    canWithdraw: ['applied', 'shortlisted', 'interview', 'offered'].includes(application.status),
    onWithdraw: async () => {
      try {
        await withdrawApplication(application._id);
        setApplications((prev) =>
          prev.map((item) =>
            item._id === application._id ? { ...item, status: 'withdrawn' } : item
          )
        );
      } catch (err) {
        setError(err.message || 'Failed to withdraw application');
      }
    },
    actions: 'view',
  }));

  return (
    <div className="min-h-screen bg-app py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-primary">Applied Jobs</h1>
          <p className="text-muted">Track your applications and their latest statuses.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-subtle rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted">Total</p>
            <p className="text-2xl font-semibold text-primary">{stats.total}</p>
          </div>
          <div className="bg-card border border-subtle rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted">Applied</p>
            <p className="text-2xl font-semibold text-primary">{stats.applied}</p>
          </div>
          <div className="bg-card border border-subtle rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted">Interview</p>
            <p className="text-2xl font-semibold text-primary">{stats.interview}</p>
          </div>
          <div className="bg-card border border-subtle rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted">Offered</p>
            <p className="text-2xl font-semibold text-primary">{stats.offered}</p>
          </div>
          <div className="bg-card border border-subtle rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted">Hired / Closed</p>
            <p className="text-2xl font-semibold text-primary">{stats.hired + stats.rejected}</p>
          </div>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-lg border border-danger-soft bg-danger-soft text-danger">
            {error}
          </div>
        )}

        <EnhancedTable
          columns={columns}
          rows={rows}
          isLoading={loading}
          skeleton={<SkeletonLoader count={5} type="table-row" />}
        />
      </div>
    </div>
  );
};

export default AppliedJobs;
