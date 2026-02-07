import api from './authService';

// ============================================
// Job Application Functions
// ============================================

// Apply for a Job (Job Seeker)
export const applyJob = async (jobId) => {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const response = await api.post(`/applications/${jobId}`);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        application: response.data.application || response.data.data,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to submit application';
    throw new Error(errorMessage);
  }
};

// Get Job Seeker Applications
export const getMyApplications = async () => {
  try {
    const response = await api.get('/applications/me');

    if (response.data.success) {
      return {
        success: true,
        count: response.data.pagination?.total ?? response.data.count ?? 0,
        applications: response.data.data || response.data.applications || [],
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch applications';
    throw new Error(errorMessage);
  }
};

// Get Applications for a Job (Employer only)
export const getApplicationsByJob = async (jobId) => {
  try {
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const response = await api.get(`/applications/job/${jobId}`);

    if (response.data.success) {
      return {
        success: true,
        count: response.data.pagination?.total ?? response.data.count ?? 0,
        applications: response.data.data || response.data.applications || [],
        pagination: response.data.pagination || null,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch applications';
    throw new Error(errorMessage);
  }
};

// Update Application Status (Employer only)
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    if (!status) {
      throw new Error('Status is required');
    }

    const allowedStatuses = ['pending', 'accepted', 'applied', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn', 'closed'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status.');
    }

    const response = await api.patch(`/applications/${applicationId}/status`, {
      status: status,
    });

    if (response.data.success) {
      const application = response.data.application || response.data.data;
      return {
        success: true,
        message: response.data.message,
        application,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update application status';
    throw new Error(errorMessage);
  }
};

// Withdraw application (Job Seeker)
export const withdrawApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    const response = await api.patch(`/applications/${applicationId}/withdraw`);
    if (response.data.success) {
      return response.data.data || response.data.application;
    }
    return null;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to withdraw application';
    throw new Error(errorMessage);
  }
};
