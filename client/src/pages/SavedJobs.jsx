import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { getSavedJobs as fetchSavedJobs } from '../services/savedJobsService';
import { applyJob } from '../services/applicationService';
import { useSavedJobs } from '../hooks/useSavedJobs';
import Button from '../components/Button';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { savedJobs, isSaved, toggleSaved, clearSaved } = useSavedJobs();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await fetchSavedJobs();
        setJobs(result || []);
      } catch (err) {
        setError(err.message || 'Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const savedJobList = useMemo(() => {
    const map = new Map();
    (jobs || []).forEach((job) => {
      if (job?._id && !map.has(job._id)) {
        map.set(job._id, job);
      }
    });
    return Array.from(map.values());
  }, [jobs]);

  const handleApply = async (jobId) => {
    try {
      await applyJob(jobId);
      setAppliedIds((prev) => [...prev, jobId]);
      setFeedback({ type: 'success', message: 'Application submitted successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to apply' });
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
            <h1 className="text-3xl font-bold text-primary">Saved Jobs</h1>
            <p className="text-muted">Keep track of opportunities you want to revisit.</p>
          </div>
          {savedJobs.length > 0 && (
            <Button variant="outline" onClick={clearSaved}>
              Clear All
            </Button>
          )}
        </div>

        {feedback && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              feedback.type === 'success'
                ? 'bg-success-soft border-success-soft text-success'
                : 'bg-danger-soft border-danger-soft text-danger'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-danger-soft bg-danger-soft text-danger">
            {error}
          </div>
        )}

        {savedJobList.length === 0 ? (
          <div className="bg-card border border-subtle rounded-2xl shadow-card p-12 text-center">
            <h2 className="text-xl font-semibold text-primary mb-2">No saved jobs yet</h2>
            <p className="text-muted mb-6">Browse jobs and save the ones you like for later.</p>
            <Button variant="primary" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobList.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onView={() => navigate(`/jobs/${job._id}`)}
                onApply={() => handleApply(job._id)}
                isApplied={appliedIds.includes(job._id)}
                isSaved={isSaved(job._id)}
                onToggleSave={() => {
                  const currentlySaved = isSaved(job._id);
                  toggleSaved(job._id);
                  if (currentlySaved) {
                    setJobs((prev) => prev.filter((item) => item._id !== job._id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
