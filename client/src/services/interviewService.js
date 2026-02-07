import api from './authService';

export const getInterviews = async () => {
  try {
    const response = await api.get('/interviews');
    if (response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to load interviews';
    throw new Error(message);
  }
};

export const createInterview = async (payload) => {
  try {
    const response = await api.post('/interviews', payload);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to schedule interview';
    throw new Error(message);
  }
};

export const updateInterview = async (id, payload) => {
  try {
    const response = await api.put(`/interviews/${id}`, payload);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update interview';
    throw new Error(message);
  }
};

export const cancelInterview = async (id) => {
  try {
    const response = await api.delete(`/interviews/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to cancel interview';
    throw new Error(message);
  }
};

export const requestInterviewUpdate = async (id, payload) => {
  try {
    const response = await api.patch(`/interviews/${id}`, payload);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to update interview';
    throw new Error(message);
  }
};
