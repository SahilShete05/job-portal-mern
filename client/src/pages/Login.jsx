import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-card border border-subtle rounded-xl shadow-card p-8 transform transition-all duration-300 hover:shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 bg-surface text-primary focus:outline-none focus:ring-2 ring-accent focus:border-[color:var(--app-accent)] ${
                  errors.email
                    ? 'border-danger-soft'
                    : 'border-subtle'
                }`}
              />
              {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 bg-surface text-primary focus:outline-none focus:ring-2 ring-accent focus:border-[color:var(--app-accent)] ${
                  errors.password
                    ? 'border-danger-soft'
                    : 'border-subtle'
                }`}
              />
              {errors.password && <p className="text-danger text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-danger-soft border border-danger-soft rounded-lg">
                <p className="text-danger text-sm font-semibold">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-6"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[color:var(--app-border)]"></div>
            <span className="text-sm text-muted">or</span>
            <div className="flex-1 h-px bg-[color:var(--app-border)]"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-[color:var(--app-accent)] font-semibold hover:underline transition-colors duration-200">
              Register here
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-muted text-sm mt-6">
          Job Portal © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
