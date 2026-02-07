import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Users } from 'lucide-react';
import { deleteJob, getEmployerJobs } from '../services/jobService';
import Button from '../components/Button';

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getEmployerJobs();
      setJobs(response.jobs || []);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm('Delete this job posting? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingId(jobId);
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      setFeedback({ type: 'success', message: 'Job deleted successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete job.' });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Jobs</h1>
            <p className="text-muted">Manage your job postings and applicants.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/post-job')}>
            Post New Job
          </Button>
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

        {error && (
          <div className="mb-6 rounded-lg border border-danger-soft bg-danger-soft p-4 text-danger">
            {error}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-card border border-subtle rounded-2xl shadow-card p-12 text-center">
            <h2 className="text-xl font-semibold text-primary mb-2">No jobs yet</h2>
            <p className="text-muted mb-6">Create your first job posting to start attracting candidates.</p>
            <Button variant="primary" onClick={() => navigate('/post-job')}>
              Post Your First Job
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-card border border-subtle rounded-2xl shadow-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">{job.title}</h3>
                    <p className="text-muted">{job.companyName}</p>
                    <p className="text-sm text-muted">{job.location}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.isActive ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                    }`}
                  >
                    {job.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}
                    icon={Users}
                  >
                    Applicants
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/post-job?jobId=${job._id}`)}
                    icon={Edit2}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(job._id)}
                    icon={Trash2}
                    disabled={deletingId === job._id}
                  >
                    {deletingId === job._id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
