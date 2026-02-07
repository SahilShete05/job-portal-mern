import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Button from './Button';

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
    salaryRange: '',
    responsibilities: '',
    requirements: '',
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

const JobCard = ({
  job,
  onApply,
  onView,
  isApplied = false,
  isSaved = false,
  onToggleSave,
}) => {
  const hasDescription = Boolean(job?.description && job.description.trim().length >= 10);
  const descriptionSource = hasDescription ? job.description : buildFallbackDescription(job);
  const parsedDescription = parseDescription(descriptionSource);
  const experienceLabel = parsedDescription.experienceLevel;
  const workTypeLabel = formatWorkType(
    parsedDescription.locationType || (job?.jobType === 'remote' ? 'Remote' : '')
  );
  const salaryLabel = normalizeSalary(job?.salary) || normalizeSalary(parsedDescription.salaryRange) || 'Negotiable';
  const summaryText = parsedDescription.summaryText || 'No description provided.';
  const descriptionText = summaryText
    .replace(/\s+/g, ' ')
    .replace(/\s\./g, '.')
    .trim();
  const postedDate = job?.createdAt
    ? new Date(job.createdAt).toLocaleDateString()
    : '';
  const skillPreview = Array.isArray(job?.skills) ? job.skills.slice(0, 3) : [];

  return (
    <div className="h-full animate-fade-in">
      <div
        className="bg-card border border-subtle rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col"
      >
        {/* Card Body */}
        <div className="p-6 flex-grow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-primary line-clamp-2">
                {job.title}
              </h2>
              <p className="text-sm text-muted mt-1">
                {job.companyName || 'Company'}
              </p>
            </div>
            {onToggleSave && (
              <button
                type="button"
                onClick={onToggleSave}
                className="p-2 rounded-full border border-subtle bg-surface hover:bg-[color:var(--app-accent-soft)] transition-colors"
                title={isSaved ? 'Remove from saved jobs' : 'Save this job'}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{job.location || 'Location not specified'}</span>
            </div>
            {workTypeLabel && (
              <span className="rounded-full border border-subtle px-2 py-0.5 text-xs font-semibold text-muted">
                {workTypeLabel}
              </span>
            )}
            {postedDate && (
              <span className="text-xs text-muted">Posted {postedDate}</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {experienceLabel && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning-soft text-warning">
                {experienceLabel}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-info-soft text-info">
              {formatJobType(job?.jobType)}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success-soft text-success">
              {salaryLabel}
            </span>
          </div>

          {/* Description Preview */}
          <p className="text-muted text-sm line-clamp-3 mt-4">
            {descriptionText}
          </p>

          {skillPreview.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {skillPreview.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[color:var(--app-accent-soft)] text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {!job.isActive && (
            <div className="mt-4 inline-flex items-center rounded-full border border-danger-soft bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
              Inactive
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="border-t border-subtle p-4 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant={isApplied ? 'secondary' : 'primary'}
            size="sm"
            onClick={onApply}
            disabled={isApplied || !job.isActive}
            className="flex-1"
          >
            {isApplied ? '✓ Applied' : 'Apply Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
