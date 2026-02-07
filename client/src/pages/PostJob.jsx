import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createJob, getJobById, updateJob } from '../services/jobService';

const jobTypeOptions = ['full-time', 'part-time', 'internship', 'remote'];

const PostJob = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const isEditing = Boolean(jobId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    companyName: '',
    jobType: jobTypeOptions[0],
    salary: '',
    skills: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);

  const requiredFields = useMemo(
    () => ['title', 'description', 'location', 'companyName', 'jobType'],
    []
  );

  const validate = useCallback(() => {
    const validationErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        validationErrors[field] = 'This field is required';
      }
    });

    if (formData.description && formData.description.trim().length < 10) {
      validationErrors.description = 'Description must be at least 10 characters';
    }

    return validationErrors;
  }, [formData, requiredFields]);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      try {
        setLoadingJob(true);
        const response = await getJobById(jobId);
        const job = response.job;
        setFormData({
          title: job?.title || '',
          description: job?.description || '',
          location: job?.location || '',
          companyName: job?.companyName || '',
          jobType: job?.jobType || jobTypeOptions[0],
          salary: job?.salary || '',
          skills: Array.isArray(job?.skills) ? job.skills.join(', ') : '',
        });
      } catch (error) {
        setApiError(error.message || 'Failed to load job');
      } finally {
        setLoadingJob(false);
      }
    };

    loadJob();
  }, [jobId]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const validationErrors = validate();

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setApiError('');

      try {
        const parsedSkills = formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean);

        if (isEditing) {
          await updateJob(jobId, {
            title: formData.title.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            companyName: formData.companyName.trim(),
            jobType: formData.jobType,
            salary: formData.salary.trim(),
            skills: parsedSkills,
          });
          navigate('/my-jobs', { replace: true });
        } else {
          await createJob({
            title: formData.title.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            companyName: formData.companyName.trim(),
            jobType: formData.jobType,
            salary: formData.salary.trim(),
            skills: parsedSkills,
          });

          navigate('/dashboard/employer', { replace: true });
        }
      } catch (error) {
        setApiError(error.message || 'Failed to save job');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditing, jobId, navigate, validate]
  );

  const renderError = useCallback(
    (field) =>
      errors[field] ? (
        <p className="mt-1 text-sm text-danger" role="alert">
          {errors[field]}
        </p>
      ) : null,
    [errors]
  );

  return (
    <div className="min-h-screen bg-app py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-card border border-subtle shadow-card rounded-2xl p-8">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-wider text-[color:var(--app-accent)] font-semibold">
              Employer
            </p>
            <h1 className="text-3xl font-bold text-primary">
              {isEditing ? 'Edit Job' : 'Post a New Job'}
            </h1>
            <p className="mt-2 text-muted">
              {isEditing
                ? 'Update your job details to attract the right candidates.'
                : 'Share a new opportunity with qualified candidates in seconds.'}
            </p>
          </div>

          {apiError && (
            <div className="mb-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-danger">
              {apiError}
            </div>
          )}

          {loadingJob ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-muted">
                Job Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                placeholder="e.g., Senior React Engineer"
              />
              {renderError('title')}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-3 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                placeholder="Describe responsibilities, requirements, and perks"
              />
              {renderError('description')}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-muted">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="e.g., Acme Corp"
                />
                {renderError('companyName')}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-muted">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="City, Country or Remote"
                />
                {renderError('location')}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-muted">
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                >
                  {jobTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ')}
                    </option>
                  ))}
                </select>
                {renderError('jobType')}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-muted">
                  Salary (optional)
                </label>
                <input
                  id="salary"
                  name="salary"
                  type="text"
                  value={formData.salary}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="e.g., $120k - $140k"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-muted">
                  Skills (comma separated)
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  value={formData.skills}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-[color:var(--app-accent)] px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:brightness-110 focus:outline-none focus:ring-2 ring-accent focus:ring-offset-2 focus:ring-offset-[color:var(--app-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? (isEditing ? 'Saving...' : 'Posting...') : isEditing ? 'Save Changes' : 'Post Job'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm font-medium text-muted hover:text-primary"
              >
                Cancel
              </button>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJob;
