import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getJobById } from '../services/jobService';
import { getApplicationsByJob, updateApplicationStatus } from '../services/applicationService';
import api, { getToken, refreshSession } from '../services/authService';
import StatusBadge from '../components/dashboard/StatusBadge';
import Button from '../components/Button';

const EmployerApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [jobResponse, applicationsResponse] = await Promise.all([
          getJobById(jobId),
          getApplicationsByJob(jobId),
        ]);

        setJob(jobResponse.job);
        setApplications(applicationsResponse.applications || []);
      } catch (err) {
        setError(err.message || 'Failed to load applicants');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const apiOrigin = useMemo(() => {
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}`;
    try {
      return new URL(baseUrl).origin;
    } catch (error) {
      return window.location.origin;
    }
  }, []);

  const statusOptions = useMemo(
    () => (['applied', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn', 'closed']),
    []
  );

  const handleStatusChange = useCallback(async (applicationId, nextStatus) => {
    try {
      setUpdatingId(applicationId);
      setFeedback(null);

      const response = await updateApplicationStatus(applicationId, nextStatus);
      const updated = response.application;

      setApplications((prev) =>
        prev.map((application) =>
          application._id === applicationId
            ? { ...application, status: updated?.status || application.status }
            : application
        )
      );

      setFeedback({ type: 'success', message: 'Application status updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const handleViewResume = useCallback(async (applicationId, resumePath, resumeUrl) => {
    if (!resumePath || !resumeUrl) {
      return;
    }

    const lowerPath = resumePath.toLowerCase();
    if (!lowerPath.endsWith('.pdf')) {
      const viewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(resumeUrl)}`;
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      if (!getToken()) {
        await refreshSession();
      }

      const makeRequest = () => api.get(`/applications/${applicationId}/resume`, {
        responseType: 'blob',
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
      });

      let response;
      try {
        response = await makeRequest();
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          await refreshSession();
          response = await makeRequest();
        } else {
          throw requestError;
        }
      }

      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to open resume',
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-card border border-subtle rounded-2xl shadow-card p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-3">Unable to load applicants</h1>
          <p className="text-muted mb-6">{error}</p>
          <Link
            to="/dashboard/employer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[color:var(--app-accent)] text-white font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app transition-colors duration-300 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-2">
          <Link to="/dashboard/employer" className="text-sm font-semibold text-[color:var(--app-accent)] hover:underline">
            ← Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold text-primary">Applicants</h1>
          <p className="text-muted">
            {job?.title ? `Job: ${job.title}` : 'Review applicants for this job.'}
          </p>
        </div>

        {feedback && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              feedback.type === 'success'
                ? 'bg-success-soft border-success-soft text-success'
                : 'bg-danger-soft border-danger-soft text-danger'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="bg-card border border-subtle rounded-2xl shadow-card overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted">No applications yet for this job.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[color:var(--app-surface)]">
                  <tr className="border-b border-subtle">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Applicant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Resume</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Update</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => {
                    const resumePath = application.resume;
                    const resumeUrl = resumePath
                      ? (resumePath.startsWith('http') ? resumePath : `${apiOrigin}/${resumePath}`)
                      : null;
                    const viewerUrl = resumeUrl
                      ? (resumePath.toLowerCase().endsWith('.pdf')
                        ? resumeUrl
                        : `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(resumeUrl)}`)
                      : null;
                    const displayStatus = application.status || 'applied';

                    return (
                      <tr
                        key={application._id}
                        className="border-b border-subtle hover:bg-[color:var(--app-accent-soft)] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-primary">
                          {application.applicant?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {application.applicant?.email || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {viewerUrl ? (
                            <button
                              type="button"
                              onClick={() => handleViewResume(application._id, resumePath, resumeUrl)}
                              className="text-[color:var(--app-accent)] hover:underline"
                            >
                              View Resume
                            </button>
                          ) : (
                            <span className="text-muted">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={displayStatus} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={displayStatus || 'applied'}
                            onChange={(event) => handleStatusChange(application._id, event.target.value)}
                            disabled={updatingId === application._id}
                            className="rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                          {updatingId === application._id && (
                            <p className="mt-2 text-xs text-muted">Updating...</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/messages?user=${application.applicant?._id}&job=${jobId}`)}
                            >
                              Message
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/interviews?applicationId=${application._id}`)}
                            >
                              Schedule
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerApplicants;