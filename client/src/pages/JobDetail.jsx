import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getJobById } from '../services/jobService';
import { applyJob, getMyApplications } from '../services/applicationService';
import Button from '../components/Button';
import { useSavedJobs } from '../hooks/useSavedJobs';

const formatJobType = (value) => {
  if (!value) return 'Full-Time';
  const normalized = String(value).toLowerCase();
  const map = {
    'full-time': 'Full-Time',
    'part-time': 'Part-Time',
    internship: 'Internship',
    remote: 'Remote',
  };
  return map[normalized] || value;
};

const formatWorkType = (value) => {
  if (!value) return '';
  const normalized = String(value).toLowerCase();
  if (normalized.includes('remote')) return 'Remote';
  if (normalized.includes('hybrid')) return 'Hybrid';
  if (normalized.includes('on-site') || normalized.includes('onsite')) return 'On-site';
  return value;
};

const parseDescription = (description = '') => {
  const normalized = String(description)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n');
  const lines = normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = {
    summaryText: '',
    experienceLevel: '',
    locationType: '',
    responsibilities: '',
    requirements: '',
    applicationDeadline: '',
    salaryRange: '',
  };

  const summary = [];

  lines.forEach((line) => {
    const match = line.match(/^([A-Za-z /]+):\s*(.*)$/);
    if (!match) {
      summary.push(line);
      return;
    }

    const label = match[1].trim().toLowerCase();
    const value = match[2].trim();

    if (label.includes('status')) {
      return;
    }

    if (label.includes('salary')) {
      parsed.salaryRange = value;
      return;
    }

    if (label.includes('skills')) {
      return;
    }

    if (label.includes('job type')) {
      return;
    }

    if (label.includes('experience')) {
      parsed.experienceLevel = value;
      return;
    }

    if (label.includes('location type')) {
      parsed.locationType = value;
      return;
    }

    if (label.includes('responsibilities')) {
      parsed.responsibilities = value;
      return;
    }

    if (label.includes('requirements')) {
      parsed.requirements = value;
      return;
    }

    if (label.includes('application deadline')) {
      parsed.applicationDeadline = value;
      return;
    }

    summary.push(line);
  });

  const baseSummary = summary.join(' ').replace(/\s+/g, ' ').trim();
  const fallbackSummary = [parsed.responsibilities, parsed.requirements]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  parsed.summaryText = baseSummary || fallbackSummary;
  return parsed;
};

const normalizeSalary = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/₹/g, 'INR ')
    .replace(/rs\.?/gi, 'INR')
    .replace(/\?/g, '')
    .replace(/^salary range:\s*/i, '')
    .replace(/^salary:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getLocationType = (job) => {
  const location = String(job?.location || '').toLowerCase();
  if (job?.jobType === 'remote' || location.includes('remote')) return 'Remote';
  if (location.includes('hybrid')) return 'Hybrid';
  return 'On-site';
};

const buildFallbackDescription = (job) => {
  const title = String(job?.title || '').toLowerCase();
  const defaults = {
    summary:
      'Join a collaborative team to deliver high-impact results and grow your skills in a modern, fast-paced environment.',
    responsibilities: [
      'Own end-to-end deliverables and collaborate across teams',
      'Communicate progress, risks, and next steps clearly',
      'Improve processes and contribute to continuous improvement',
    ],
    requirements: [
      'Strong problem-solving and communication skills',
      'Ability to manage priorities and deadlines',
      'Experience working in cross-functional teams',
    ],
    experience: '2+ years',
  };

  const roleMap = [
    {
      match: /product manager/, 
      summary:
        'Own the product roadmap and drive cross-functional execution to deliver meaningful customer outcomes.',
      responsibilities: [
        'Define product vision and roadmap',
        'Gather user feedback and market insights',
        'Prioritize the backlog and align stakeholders',
        'Partner with design and engineering for delivery',
        'Measure outcomes and iterate on key metrics',
      ],
      requirements: [
        '3+ years in product management',
        'Strong analytical and prioritization skills',
        'Experience with agile delivery',
        'Excellent stakeholder communication',
      ],
      experience: '3-6 years',
    },
    {
      match: /data analyst/, 
      summary:
        'Analyze data to uncover insights, build dashboards, and guide data-driven decisions across the business.',
      responsibilities: [
        'Build and optimize SQL queries and reports',
        'Create dashboards for key business metrics',
        'Validate data quality and maintain pipelines',
        'Translate findings into actionable insights',
        'Support ad-hoc analysis for stakeholders',
      ],
      requirements: [
        '2+ years in analytics or BI',
        'Strong SQL and Python skills',
        'Experience with Power BI/Tableau',
        'Solid understanding of statistics',
      ],
      experience: '2-4 years',
    },
    {
      match: /qa automation/, 
      summary:
        'Build and maintain automated test suites to ensure reliable releases and excellent product quality.',
      responsibilities: [
        'Design and implement automated test cases',
        'Integrate tests into CI/CD pipelines',
        'Perform regression and smoke testing',
        'Report defects and verify fixes',
        'Collaborate with developers on quality standards',
      ],
      requirements: [
        '2+ years in QA automation',
        'Hands-on with Selenium or Cypress',
        'API testing experience',
        'Familiarity with test frameworks',
      ],
      experience: '2-5 years',
    },
    {
      match: /devops/, 
      summary:
        'Improve deployment pipelines and infrastructure reliability for scalable, secure production systems.',
      responsibilities: [
        'Manage CI/CD and deployment automation',
        'Implement infrastructure as code',
        'Monitor performance and reliability',
        'Harden security and compliance practices',
        'Optimize cost and operational efficiency',
      ],
      requirements: [
        '3+ years in DevOps or SRE',
        'Docker and Kubernetes experience',
        'Terraform or similar IaC tools',
        'Cloud platform knowledge (AWS/Azure/GCP)',
      ],
      experience: '3-6 years',
    },
    {
      match: /react native|mobile app/, 
      summary:
        'Build polished, high-performance mobile experiences using React Native and modern mobile best practices.',
      responsibilities: [
        'Develop mobile features and UI components',
        'Integrate APIs and third-party services',
        'Optimize performance and responsiveness',
        'Write tests and maintain code quality',
        'Ship releases to app stores',
      ],
      requirements: [
        '2+ years of React Native experience',
        'Strong JavaScript/TypeScript skills',
        'Understanding of native modules',
        'Experience with mobile release cycles',
      ],
      experience: '2-5 years',
    },
    {
      match: /ui\/ux|ux designer|ui designer|product designer/, 
      summary:
        'Create intuitive user experiences and visually polished interfaces that delight customers.',
      responsibilities: [
        'Design wireframes, prototypes, and high-fidelity UI',
        'Conduct user research and usability testing',
        'Collaborate with PM and engineering teams',
        'Maintain and evolve the design system',
        'Iterate based on feedback and analytics',
      ],
      requirements: [
        '2+ years in UI/UX design',
        'Proficiency with Figma',
        'Strong UX research skills',
        'Solid visual design fundamentals',
      ],
      experience: '2-5 years',
    },
    {
      match: /full stack|mern/, 
      summary:
        'Build end-to-end web features across frontend and backend to deliver reliable, scalable products.',
      responsibilities: [
        'Develop UI features and backend APIs',
        'Design and maintain database schemas',
        'Integrate authentication and security best practices',
        'Collaborate on architecture and code reviews',
        'Monitor and improve performance',
      ],
      requirements: [
        '2+ years of full-stack development',
        'Strong React and Node.js skills',
        'Experience with MongoDB/SQL databases',
        'Understanding of REST APIs',
      ],
      experience: '2-5 years',
    },
    {
      match: /backend|node\.js|nodejs/, 
      summary:
        'Design and build robust APIs and services that power scalable applications.',
      responsibilities: [
        'Develop RESTful services and integrations',
        'Write efficient queries and data models',
        'Implement authentication and authorization',
        'Optimize performance and reliability',
        'Maintain documentation and tests',
      ],
      requirements: [
        '2+ years of backend development',
        'Proficiency in Node.js and Express',
        'Database experience (MongoDB/SQL)',
        'Knowledge of API security and best practices',
      ],
      experience: '2-5 years',
    },
    {
      match: /frontend|react/, 
      summary:
        'Create responsive, accessible interfaces that deliver seamless user experiences.',
      responsibilities: [
        'Build reusable UI components',
        'Translate designs into pixel-perfect layouts',
        'Integrate APIs and manage client state',
        'Ensure performance and accessibility',
        'Collaborate with design and backend teams',
      ],
      requirements: [
        '2+ years of frontend development',
        'Strong React and JavaScript/TypeScript',
        'Familiarity with modern CSS frameworks',
        'Understanding of UX best practices',
      ],
      experience: '2-5 years',
    },
    {
      match: /intern/, 
      summary:
        'Learn by contributing to real features under mentorship while building strong engineering fundamentals.',
      responsibilities: [
        'Support development tasks and bug fixes',
        'Write clean, maintainable code',
        'Participate in code reviews and standups',
        'Document learnings and progress',
      ],
      requirements: [
        'Basic understanding of programming concepts',
        'Familiarity with JavaScript or Python',
        'Eagerness to learn and collaborate',
      ],
      experience: '0-1 years',
    },
  ];

  const match = roleMap.find((role) => role.match.test(title));
  const role = match || defaults;
  const locationType = getLocationType(job);

  return [
    role.summary,
    role.experience ? `Experience Level: ${role.experience}` : '',
    locationType ? `Location Type: ${locationType}` : '',
    role.responsibilities?.length
      ? `Responsibilities: ${role.responsibilities.join('; ')}`
      : '',
    role.requirements?.length
      ? `Requirements: ${role.requirements.join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const toList = (value) => {
  if (!value) return [];
  let parts = String(value)
    .split(/;|\u2022|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length <= 1 && value.includes(',')) {
    parts = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return parts;
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedJobs();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const descriptionSource = useMemo(() => {
    if (job?.description && job.description.trim().length >= 10) {
      return job.description;
    }
    return buildFallbackDescription(job);
  }, [job]);

  const parsedDescription = useMemo(
    () => parseDescription(descriptionSource),
    [descriptionSource]
  );
  const jobTypeLabel = formatJobType(job?.jobType);
  const workTypeLabel = formatWorkType(
    parsedDescription.locationType || (job?.jobType === 'remote' ? 'Remote' : '')
  );
  const salaryLabel = useMemo(
    () => normalizeSalary(job?.salary) || normalizeSalary(parsedDescription.salaryRange) || 'Negotiable',
    [job?.salary, parsedDescription.salaryRange]
  );
  const responsibilities = useMemo(
    () => toList(parsedDescription.responsibilities),
    [parsedDescription.responsibilities]
  );
  const requirements = useMemo(
    () => toList(parsedDescription.requirements),
    [parsedDescription.requirements]
  );

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getJobById(id);
        setJob(response.job);
      } catch (err) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user || user.role !== 'jobseeker') {
        setAppliedJobs([]);
        return;
      }

      try {
        const response = await getMyApplications();
        const appliedIds = (response.applications || [])
          .map((application) => application?.job?._id)
          .filter(Boolean);
        setAppliedJobs(appliedIds);
      } catch (err) {
        console.error('Failed to load applications:', err);
      }
    };

    fetchAppliedJobs();
  }, [user]);

  const isApplied = useMemo(() => {
    if (!job?._id) return false;
    return appliedJobs.includes(job._id);
  }, [appliedJobs, job]);

  const handleApply = useCallback(async () => {
    if (!user) {
      setFeedback({ type: 'error', message: 'Please login to apply for jobs.' });
      return;
    }

    if (user.role !== 'jobseeker') {
      setFeedback({ type: 'error', message: 'Only job seekers can apply for jobs.' });
      return;
    }

    if (!job?._id) {
      setFeedback({ type: 'error', message: 'Job not found.' });
      return;
    }

    try {
      setSubmitting(true);
      await applyJob(job._id);
      setAppliedJobs((prev) => [...prev, job._id]);
      setFeedback({ type: 'success', message: 'Application submitted successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }, [job, user]);

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
          <h1 className="text-2xl font-bold text-primary mb-3">Job not found</h1>
          <p className="text-muted mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" onClick={() => navigate('/jobs')}>
              Back to Jobs
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-app transition-colors duration-300 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/jobs"
            className="text-sm font-semibold text-[color:var(--app-accent)] hover:underline"
          >
            ← Back to jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-subtle rounded-2xl shadow-card p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wider text-[color:var(--app-accent)] font-semibold">
                    {job.companyName || 'Company'}
                  </p>
                  <h1 className="text-3xl font-bold text-primary mt-2">
                    {job.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-muted">
                    <span>{job.location || 'Location not specified'}</span>
                    {workTypeLabel && (
                      <span className="rounded-full border border-subtle px-2 py-0.5 text-xs font-semibold text-muted">
                        {workTypeLabel}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedDescription.experienceLevel && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-warning-soft text-warning">
                      {parsedDescription.experienceLevel}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-info-soft text-info">
                    {jobTypeLabel}
                  </span>
                  {!job.isActive && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-danger-soft text-danger">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-subtle pt-6">
                <h2 className="text-lg font-semibold text-primary mb-3">
                  Role Summary
                </h2>
                <p className="text-primary leading-relaxed">
                  {parsedDescription.summaryText || 'No additional summary provided.'}
                </p>
                {responsibilities.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-base font-semibold text-primary mb-2">
                      Responsibilities
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted">
                      {responsibilities.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {requirements.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-base font-semibold text-primary mb-2">
                      Requirements
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted">
                      {requirements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {job.skills?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-sm font-semibold bg-[color:var(--app-accent-soft)] text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-subtle rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">
                Job Overview
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Salary</span>
                  <span className="font-semibold text-primary">
                    {salaryLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Job type</span>
                  <span className="font-semibold text-primary">{jobTypeLabel}</span>
                </div>
                {workTypeLabel && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Work mode</span>
                    <span className="font-semibold text-primary">{workTypeLabel}</span>
                  </div>
                )}
                {parsedDescription.experienceLevel && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Experience</span>
                    <span className="font-semibold text-primary">
                      {parsedDescription.experienceLevel}
                    </span>
                  </div>
                )}
                {parsedDescription.applicationDeadline && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Application deadline</span>
                    <span className="font-semibold text-primary">
                      {parsedDescription.applicationDeadline}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Posted</span>
                  <span className="font-semibold text-primary">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Status</span>
                  <span className={`font-semibold ${job.isActive ? 'text-success' : 'text-muted'}`}>
                    {job.isActive ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              {feedback && (
                <div
                  className={`mt-6 rounded-lg border p-4 text-sm ${
                    feedback.type === 'success'
                      ? 'bg-success-soft border-success-soft text-success'
                      : 'bg-danger-soft border-danger-soft text-danger'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="mt-6">
                <Button
                  variant={isSaved(job._id) ? 'secondary' : 'outline'}
                  size="lg"
                  className="w-full mb-3"
                  onClick={() => toggleSaved(job._id)}
                >
                  {isSaved(job._id) ? '✓ Saved' : 'Save Job'}
                </Button>
                <Button
                  variant={isApplied ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full"
                  onClick={handleApply}
                  disabled={isApplied || !job.isActive || submitting}
                >
                  {isApplied ? '✓ Applied' : submitting ? 'Submitting...' : 'Apply Now'}
                </Button>
                {job?.createdBy?._id && user?.role === 'jobseeker' && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full mt-3"
                    onClick={() => navigate(`/messages?user=${job.createdBy._id}&job=${job._id}`)}
                  >
                    Message Employer
                  </Button>
                )}
                {!user && (
                  <p className="text-xs text-muted mt-3 text-center">
                    Please sign in to apply for this job.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card border border-subtle rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-primary mb-3">Company</h3>
              <p className="text-primary font-semibold">
                {job.companyName || 'Company name not provided'}
              </p>
              {job.createdBy?.email && (
                <p className="text-sm text-muted mt-2">
                  Contact: {job.createdBy.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;