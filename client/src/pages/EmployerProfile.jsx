import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/authService';

const EmployerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    companyWebsite: '',
    industry: '',
    companySize: '',
    location: '',
    description: '',
    logo: '',
  });

  const [logoPreview, setLogoPreview] = useState('');

  const fetchEmployerProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/profile/employer');

      if (response.data.success) {
        const profile = response.data.data || {};
        setFormData({
          companyName: profile.companyName || '',
          contactEmail: profile.contactEmail || '',
          companyWebsite: profile.companyWebsite || '',
          industry: profile.industry || '',
          companySize: profile.companySize || '',
          location: profile.location || '',
          description: profile.description || '',
          logo: profile.logo || '',
        });
        setLogoPreview(profile.logo || '');
      } else {
        setError(response.data.message || 'Failed to load employer profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load employer profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployerProfile();
  }, [fetchEmployerProfile]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  }, []);

  const handleLogoUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setFormData((prev) => ({ ...prev, logo: result }));
        setLogoPreview(result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const validate = useCallback(() => {
    const errors = [];

    if (!formData.companyName.trim()) {
      errors.push('Company name is required');
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.push('Please provide a valid contact email');
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!validate()) {
        return;
      }

      try {
        setSaving(true);
        setError('');
        setMessage('');

        const response = await api.put('/profile/employer', {
          companyName: formData.companyName.trim(),
          contactEmail: formData.contactEmail.trim(),
          companyWebsite: formData.companyWebsite.trim(),
          industry: formData.industry.trim(),
          companySize: formData.companySize.trim(),
          location: formData.location.trim(),
          description: formData.description.trim(),
          logo: formData.logo.trim(),
        });

        if (response.data.success) {
          setMessage('Employer profile updated successfully.');
        } else {
          setError(response.data.message || 'Failed to update employer profile');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to update employer profile');
      } finally {
        setSaving(false);
      }
    },
    [formData, validate]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[color:var(--app-accent)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-card border border-subtle shadow-card rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Employer Profile</h1>
            <p className="mt-2 text-muted">
              Update your company details visible to candidates.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-danger">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-lg border border-success-soft bg-success-soft px-4 py-3 text-success">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Acme Corp"
                required
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-muted">
                Contact Email
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                placeholder="hiring@company.com"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-muted">
                  Industry
                </label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  value={formData.industry}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="e.g., SaaS, FinTech"
                />
              </div>
              <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-muted">
                  Company Size
                </label>
                <input
                  id="companySize"
                  name="companySize"
                  type="text"
                  value={formData.companySize}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  placeholder="e.g., 11-50"
                />
              </div>
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
                placeholder="City, Country"
              />
            </div>

            <div>
              <label htmlFor="companyWebsite" className="block text-sm font-medium text-muted">
                Company Website
              </label>
              <input
                id="companyWebsite"
                name="companyWebsite"
                type="url"
                value={formData.companyWebsite}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                placeholder="https://company.com"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-muted">
                Logo URL or Upload
              </label>
              <input
                id="logo"
                name="logo"
                type="url"
                value={formData.logo}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                placeholder="https://company.com/logo.png"
              />
              <div className="mt-3 flex items-center gap-4">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
                  <label
                    htmlFor="logoUpload"
                    className="inline-flex items-center justify-center rounded-lg border border-subtle bg-surface px-3 py-2 text-xs font-semibold text-muted hover:bg-[color:var(--app-accent-soft)] cursor-pointer"
                  >
                    Upload Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logoUpload"
                  />
                </div>
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="h-10 w-10 rounded-full object-cover border border-subtle"
                  />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-3 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                placeholder="Tell candidates about your company, culture, and mission."
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-[color:var(--app-accent)] px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:brightness-110 focus:outline-none focus:ring-2 ring-accent focus:ring-offset-2 focus:ring-offset-[color:var(--app-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
