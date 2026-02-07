import api from './authService';

export const getSavedJobs = async () => {
  const response = await api.get('/saved-jobs');
  if (response.data.success) {
    return response.data.data || [];
  }
  return [];
};

export const toggleSavedJob = async (jobId) => {
  const response = await api.post(`/saved-jobs/${jobId}`);
  return response.data;
};

export const clearSavedJobs = async () => {
  const response = await api.delete('/saved-jobs');
  return response.data;
};
