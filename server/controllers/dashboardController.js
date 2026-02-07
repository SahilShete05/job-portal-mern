const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

// JOB SEEKER DASHBOARD
exports.getJobSeekerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Use aggregation pipeline for optimal performance
    const dashboardData = await JobApplication.aggregate([
      // Match only applications by current job seeker
      { $match: { applicant: userId } },
      
      // Group by status to get counts
      {
        $facet: {
          // Summary statistics
          statusSummary: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
          
          // Recent applications (last 5)
          recentApplications: [
            { $sort: { appliedAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'jobs',
                localField: 'job',
                foreignField: '_id',
                as: 'jobDetails',
              },
            },
            {
              $unwind: '$jobDetails',
            },
            {
              $lookup: {
                from: 'users',
                localField: 'jobDetails.createdBy',
                foreignField: '_id',
                as: 'companyDetails',
              },
            },
            {
              $unwind: '$companyDetails',
            },
            {
              $project: {
                _id: 1,
                status: 1,
                appliedAt: 1,
                resume: 1,
                jobTitle: '$jobDetails.title',
                companyName: '$jobDetails.companyName',
                location: '$jobDetails.location',
                jobType: '$jobDetails.jobType',
                companyEmail: '$companyDetails.email',
              },
            },
          ],
          
          // Total count
          totalCount: [
            {
              $count: 'total',
            },
          ],
        },
      },
    ]);

    // Transform status summary to object format
    const statusCounts = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
      withdrawn: 0,
      closed: 0,
    };

    dashboardData[0].statusSummary.forEach(status => {
      statusCounts[status._id] = status.count;
    });

    const totalApplications = dashboardData[0].totalCount[0]?.total || 0;
    const recentApplications = dashboardData[0].recentApplications || [];

    res.status(200).json({
      success: true,
      message: 'Job seeker dashboard retrieved successfully',
      data: {
        statistics: {
          totalApplications,
          appliedCount: statusCounts.applied,
          shortlistedCount: statusCounts.shortlisted,
          interviewCount: statusCounts.interview,
          offeredCount: statusCounts.offered,
          hiredCount: statusCounts.hired,
          rejectedCount: statusCounts.rejected,
          withdrawnCount: statusCounts.withdrawn,
          closedCount: statusCounts.closed,
        },
        recentApplications,
      },
    });
  } catch (error) {
    console.error('Get job seeker dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job seeker dashboard',
      error: error.message,
    });
  }
};

// EMPLOYER DASHBOARD
exports.getEmployerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get dashboard data using aggregation pipelines
    const dashboardData = await Job.aggregate([
      // Match only jobs created by current employer
      { $match: { createdBy: userId } },
      
      {
        $facet: {
          // Job statistics and recent jobs
          jobsData: [
            {
              $group: {
                _id: null,
                totalJobs: { $sum: 1 },
                activeJobs: {
                  $sum: { $cond: ['$isActive', 1, 0] },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalJobs: 1,
                activeJobs: 1,
              },
            },
          ],
          
          // Recent jobs posted (last 5)
          recentJobs: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                title: 1,
                companyName: 1,
                location: 1,
                jobType: 1,
                isActive: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    // Get applications data using aggregation
    const applicationsData = await JobApplication.aggregate([
      // First, lookup jobs to filter by employer
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      {
        $unwind: '$jobDetails',
      },
      // Match only applications for jobs owned by current employer
      {
        $match: { 'jobDetails.createdBy': userId },
      },
      
      {
        $facet: {
          // Application status summary
          statusSummary: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
          
          // Total applications count
          totalCount: [
            {
              $count: 'total',
            },
          ],
          
          // Recent applications (last 5)
          recentApplications: [
            { $sort: { appliedAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: 'applicant',
                foreignField: '_id',
                as: 'applicantDetails',
              },
            },
            {
              $unwind: '$applicantDetails',
            },
            {
              $project: {
                _id: 1,
                status: 1,
                appliedAt: 1,
                applicantName: '$applicantDetails.name',
                applicantEmail: '$applicantDetails.email',
                jobTitle: '$jobDetails.title',
                resume: 1,
              },
            },
          ],
        },
      },
    ]);

    // Transform status summary to object format
    const statusCounts = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
      withdrawn: 0,
      closed: 0,
    };

    applicationsData[0].statusSummary.forEach(status => {
      statusCounts[status._id] = status.count;
    });

    const totalApplications = applicationsData[0].totalCount[0]?.total || 0;
    const recentApplications = applicationsData[0].recentApplications || [];

    const jobsStats = dashboardData[0].jobsData[0] || {
      totalJobs: 0,
      activeJobs: 0,
    };

    res.status(200).json({
      success: true,
      message: 'Employer dashboard retrieved successfully',
      data: {
        jobStatistics: {
          totalJobs: jobsStats.totalJobs,
          activeJobs: jobsStats.activeJobs,
          inactiveJobs: jobsStats.totalJobs - jobsStats.activeJobs,
        },
        applicationStatistics: {
          totalApplications,
          appliedCount: statusCounts.applied,
          shortlistedCount: statusCounts.shortlisted,
          interviewCount: statusCounts.interview,
          offeredCount: statusCounts.offered,
          hiredCount: statusCounts.hired,
          rejectedCount: statusCounts.rejected,
          withdrawnCount: statusCounts.withdrawn,
          closedCount: statusCounts.closed,
        },
        recentJobs: dashboardData[0].recentJobs || [],
        recentApplications,
      },
    });
  } catch (error) {
    console.error('Get employer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employer dashboard',
      error: error.message,
    });
  }
};

