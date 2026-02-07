import api from './authService';

// ============================================
// Dashboard Functions
// ============================================

// Get Job Seeker Dashboard (Applied Jobs)
export const getJobSeekerDashboard = async () => {
  try {
    const response = await api.get('/dashboard/jobseeker');

    if (response.data.success) {
      return {
        success: true,
        totalApplications: response.data.totalApplications,
        applicationsByStatus: response.data.applicationsByStatus,
        applications: response.data.applications,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch job seeker dashboard';
    throw new Error(errorMessage);
  }
};

// Get Employer Dashboard (Posted Jobs & Applicants)
export const getEmployerDashboard = async () => {
  try {
    const response = await api.get('/dashboard/employer');

    if (response.data.success) {
      return {
        success: true,
        totalJobs: response.data.totalJobs,
        totalApplications: response.data.totalApplications,
        jobsWithApplications: response.data.jobsWithApplications,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch employer dashboard';
    throw new Error(errorMessage);
  }
};
