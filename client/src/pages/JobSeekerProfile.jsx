import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfileCard from '../components/profile/ProfileCard';
import InputField from '../components/profile/InputField';
import TextAreaField from '../components/profile/TextAreaField';
import SkillsInput from '../components/profile/SkillsInput';
import ResumeUploader from '../components/profile/ResumeUploader';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import { User, Mail, Phone, MapPin, FileText, Briefcase, AlertCircle, Save, X } from 'lucide-react';
import api from '../services/authService';

const JobSeekerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    about: '',
    skills: [],
    experience: '',
    resume: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/profile/me');

      if (response.data.success) {
        const profileData = response.data.data;
        setFormData({
          fullName: profileData.fullName || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          about: profileData.about || '',
          skills: profileData.skills || [],
          experience: profileData.experience || '',
          resume: profileData.resume || null,
        });
      } else {
        setError(response.data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long';
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const response = await api.put('/profile/me', {
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        about: formData.about,
        skills: formData.skills,
        experience: formData.experience,
      });

      if (response.data.success) {
        showMessage('Profile updated successfully!', 'success');
        setIsEditing(false);
      } else {
        showMessage(response.data.message || 'Update failed', 'error');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Update failed';
      showMessage(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app transition-colors duration-200">
      {/* Header */}
      <div className="bg-surface shadow-soft border-b border-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className="text-3xl font-bold text-primary"
              >
                My Profile
              </h1>
              <p className="text-muted">
                Manage your professional information and resume
              </p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-surface text-primary hover:bg-[color:var(--app-accent-soft)] disabled:opacity-50"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      saving
                        ? 'opacity-50 cursor-not-allowed'
                        : 'bg-[color:var(--app-accent)] text-white hover:brightness-110'
                    }`}
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--app-accent)] text-white font-medium rounded-lg hover:brightness-110 transition-colors duration-200"
                >
                  <FileText size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div
            className="rounded-lg p-4 mb-6 flex items-start gap-4 bg-danger-soft border border-danger-soft"
          >
            <AlertCircle className="flex-shrink-0 mt-0.5 text-danger" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger">
                Error loading profile
              </p>
              <p className="text-sm mt-1 text-danger">
                {error}
              </p>
              <button
                onClick={fetchProfile}
                className="text-sm font-medium mt-3 px-4 py-2 rounded transition-colors duration-200 bg-danger-soft text-danger hover:brightness-110"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Message Alert */}
        {message && (
          <div
            className={`rounded-lg p-4 mb-6 border ${
              messageType === 'success'
                ? 'bg-success-soft border-success-soft'
                : 'bg-danger-soft border-danger-soft'
            }`}
          >
            <p
              className={`text-sm ${
                messageType === 'success' ? 'text-success' : 'text-danger'
              }`}
            >
              {message}
            </p>
          </div>
        )}

        {!error && (
          <div className="space-y-6">
            {/* Personal Information */}
            <ProfileCard title="Personal Information" icon={User}>
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={errors.fullName}
                  />
                  <InputField
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    helperText="Email cannot be changed"
                  />
                  <InputField
                    label="Phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                  />
                  <InputField
                    label="Location"
                    placeholder="New York, USA"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted">
                      Full Name
                    </p>
                    <p className="text-lg text-primary">
                      {formData.fullName || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted">
                      Email
                    </p>
                    <p className="text-lg text-primary">
                      {user?.email || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted">
                      Phone
                    </p>
                    <p className="text-lg text-primary">
                      {formData.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-muted">
                      Location
                    </p>
                    <p className="text-lg text-primary">
                      {formData.location || '—'}
                    </p>
                  </div>
                </div>
              )}
            </ProfileCard>

            {/* About Me */}
            <ProfileCard title="About Me" icon={Mail}>
              {isEditing ? (
                <TextAreaField
                  label="About"
                  placeholder="Tell us about yourself..."
                  value={formData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  rows={4}
                  helperText="Share your professional background and interests"
                />
              ) : (
                <p className="whitespace-pre-wrap text-primary">
                  {formData.about || '—'}
                </p>
              )}
            </ProfileCard>

            {/* Skills */}
            <ProfileCard title="Skills" icon={Briefcase}>
              {isEditing ? (
                <SkillsInput
                  skills={formData.skills}
                  onChange={(newSkills) => handleInputChange('skills', newSkills)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills && formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-[color:var(--app-accent-soft)] text-[color:var(--app-accent)]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted">
                      No skills added yet
                    </p>
                  )}
                </div>
              )}
            </ProfileCard>

            {/* Experience */}
            <ProfileCard title="Experience" icon={FileText}>
              {isEditing ? (
                <TextAreaField
                  label="Experience"
                  placeholder="Describe your work experience..."
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  rows={4}
                  helperText="Include job titles, companies, and achievements"
                />
              ) : (
                <p className="whitespace-pre-wrap text-primary">
                  {formData.experience || '—'}
                </p>
              )}
            </ProfileCard>

            {/* Resume Upload */}
            <ResumeUploader
              currentResume={formData.resume}
              onUploadSuccess={(data) => {
                handleInputChange('resume', data?.resume ?? null);
                if (data?.resume) {
                  showMessage('Resume uploaded successfully!', 'success');
                }
              }}
              onError={(err) => {
                showMessage(err, 'error');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerProfile;
