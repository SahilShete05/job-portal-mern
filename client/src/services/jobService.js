import api from './authService';

// ============================================
// Job Management Functions
// ============================================

// Get All Jobs with optional filtering
export const getJobs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.title) {
      params.append('title', filters.title);
    }
    if (filters.location) {
      params.append('location', filters.location);
    }
    if (filters.jobType) {
      params.append('jobType', filters.jobType);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const response = await api.get(`/jobs?${params.toString()}`);

    if (response.data.success) {
      const jobs = response.data.jobs || response.data.data || [];
      const count = response.data.count ?? response.data.pagination?.total ?? jobs.length;
      return {
        success: true,
        count,
        jobs,
        pagination: response.data.pagination || null,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch jobs';
    throw new Error(errorMessage);
  }
};

// Get Single Job by ID
export const getJobById = async (id) => {
  try {
    if (!id) {
      throw new Error('Job ID is required');
    }

    const response = await api.get(`/jobs/${id}`);

    if (response.data.success) {
      const job = response.data.job || response.data.data;
      return {
        success: true,
        job,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch job';
    throw new Error(errorMessage);
  }
};

// Create Job (Employer only)
export const createJob = async (data) => {
  try {
    if (!data.title || !data.description) {
      throw new Error('Title and description are required');
    }

    const response = await api.post('/jobs', {
      title: data.title,
      description: data.description,
      location: data.location || '',
      companyName: data.companyName || '',
      jobType: data.jobType || 'full-time',
      salary: data.salary || '',
      skills: Array.isArray(data.skills) ? data.skills : [],
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        job: response.data.data || response.data.job,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create job';
    throw new Error(errorMessage);
  }
};

// Update Job (Employer only)
export const updateJob = async (id, data) => {
  try {
    if (!id) {
      throw new Error('Job ID is required');
    }

    const response = await api.put(`/jobs/${id}`, {
      title: data.title,
      description: data.description,
      location: data.location,
      companyName: data.companyName,
      jobType: data.jobType,
      salary: data.salary,
      skills: data.skills,
      isActive: data.isActive,
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        job: response.data.job,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update job';
    throw new Error(errorMessage);
  }
};

// Delete Job (Employer only)
export const deleteJob = async (id) => {
  try {
    if (!id) {
      throw new Error('Job ID is required');
    }

    const response = await api.delete(`/jobs/${id}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete job';
    throw new Error(errorMessage);
  }
};

// Get employer's jobs
export const getEmployerJobs = async () => {
  try {
    const response = await api.get('/jobs/employer/me');
    if (response.data.success) {
      const jobs = response.data.data || response.data.jobs || [];
      return {
        success: true,
        jobs,
        pagination: response.data.pagination || null,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch employer jobs';
    throw new Error(errorMessage);
  }
};
