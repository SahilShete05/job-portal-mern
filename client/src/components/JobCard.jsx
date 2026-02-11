import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Button from './Button';
import {
  buildFallbackDescription,
  formatJobType,
  formatWorkType,
  normalizeSalary,
  parseDescription,
} from '../utils/jobFormatting';

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
              <h2 className="text-xl font-semibold text-primary leading-snug">
                {job.title || 'Untitled role'}
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
