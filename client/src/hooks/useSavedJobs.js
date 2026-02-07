import { useCallback, useEffect, useState } from 'react';
import { clearSavedJobs, getSavedJobs, toggleSavedJob } from '../services/savedJobsService';
import { useAuth } from './useAuth';

export const useSavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setSavedJobs([]);
        setLoading(false);
        return;
      }

      try {
        const jobs = await getSavedJobs();
        setSavedJobs(jobs.map((job) => job._id));
      } catch {
        setSavedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const isSaved = useCallback((jobId) => savedJobs.includes(jobId), [savedJobs]);

  const toggleSaved = useCallback(async (jobId) => {
    if (!user) return;
    setSavedJobs((prev) => (
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    ));

    try {
      await toggleSavedJob(jobId);
    } catch {
      // Revert on failure
      setSavedJobs((prev) => (
        prev.includes(jobId)
          ? prev.filter((id) => id !== jobId)
          : [...prev, jobId]
      ));
    }
  }, [user]);

  const clearSaved = useCallback(async () => {
    if (!user) return;
    setSavedJobs([]);
    try {
      await clearSavedJobs();
    } catch {
      // ignore
    }
  }, [user]);

  return {
    savedJobs,
    isSaved,
    toggleSaved,
    clearSaved,
    loading,
  };
};
