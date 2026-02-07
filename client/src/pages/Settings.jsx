import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../hooks/useAuth';
import { changePassword } from '../services/authService';
import Button from '../components/Button';

const Settings = () => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!formData.currentPassword || !formData.newPassword) {
      setFeedback({ type: 'error', message: 'Please complete all password fields.' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      setSaving(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFeedback({ type: 'success', message: 'Password updated successfully.' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to update password.' });
    } finally {
      setSaving(false);
    }
  }, [formData]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-app transition-colors duration-300 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Settings</h1>
          <p className="text-muted">
            Manage your account preferences and security.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-subtle rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-primary">Appearance</h2>
            <p className="text-sm text-muted mb-4">
              Toggle dark mode across the application.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-muted">Dark mode</span>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDark ? 'bg-[color:var(--app-accent)]' : 'bg-[color:var(--app-border)]'
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-card border border-subtle rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-primary">Change Password</h2>
            <p className="text-sm text-muted mb-4">
              Update your password to keep your account secure.
            </p>

            {feedback && (
              <div
                className={`mb-4 rounded-lg border p-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-success-soft border-success-soft text-success'
                    : 'bg-danger-soft border-danger-soft text-danger'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-subtle bg-surface px-4 py-2.5 text-primary shadow-soft focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" loading={saving} className="w-full">
                Update Password
              </Button>
            </form>
          </div>

          <div className="bg-card border border-subtle rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-primary">Session</h2>
            <p className="text-sm text-muted mb-4">
              Sign out of your account on this device.
            </p>
            <Button variant="outline" size="lg" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;