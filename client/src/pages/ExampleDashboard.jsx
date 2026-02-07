import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import EnhancedStatCard from '../components/common/EnhancedStatCard';
import EmptyState from '../components/common/EmptyState';
import AnimatedSkeletonLoader from '../components/common/AnimatedSkeletonLoader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Briefcase, Users, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

/**
 * EXAMPLE: Complete Dashboard with all UI polish components
 * Shows best practices for animations, loading states, empty states, and dark mode
 */
const ExampleDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setData({
        stats: {
          total: 1250,
          shortlisted: 89,
          rejected: 45,
          pending: 1116,
        },
        items: [
          { id: 1, title: 'Senior Developer', company: 'Tech Corp', status: 'shortlisted' },
          { id: 2, title: 'UI Designer', company: 'Design Inc', status: 'applied' },
        ],
      });
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-app">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Error State */}
          <div
            className="rounded-lg p-4 flex items-start gap-4 bg-danger-soft border border-danger-soft"
          >
            <AlertCircle className="flex-shrink-0 mt-0.5 text-danger" size={20} />
            <div className="flex-1">
              <p className="font-medium text-danger">
                Error loading dashboard
              </p>
              <p className="text-sm mt-1 text-danger">
                {error}
              </p>
              <Button variant="secondary" size="sm" onClick={fetchData} className="mt-3">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200 bg-app">
      {/* Header Section */}
      <div
        className="bg-surface shadow-soft border-b border-subtle"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-muted">
                Here's your dashboard overview
              </p>
            </div>
            <Button icon={Plus} onClick={() => navigate('/action')}>
              Take Action
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid with Animations */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedSkeletonLoader count={4} type="card" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <EnhancedStatCard
              label="Total Items"
              value={data.stats.total}
              icon={Briefcase}
              color="blue"
              trend={{ value: 5, direction: 'up' }}
            />
            <EnhancedStatCard
              label="Shortlisted"
              value={data.stats.shortlisted}
              icon={CheckCircle}
              color="green"
              trend={{ value: 12, direction: 'up' }}
            />
            <EnhancedStatCard
              label="Rejected"
              value={data.stats.rejected}
              icon={XCircle}
              color="red"
            />
            <EnhancedStatCard
              label="Pending"
              value={data.stats.pending}
              icon={Users}
              color="purple"
            />
          </div>
        ) : null}

        {/* Content Section */}
        {loading ? (
          <Card padding>
            <AnimatedSkeletonLoader count={5} type="table-row" />
          </Card>
        ) : data && data.items.length > 0 ? (
          <Card hover animated className="mb-8 animate-fade-in">
            <h2 className="text-lg font-bold mb-4 text-primary">
              Recent Items
            </h2>
            <div className="space-y-3">
              {data.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-subtle bg-surface transition-all duration-300 hover:shadow-md hover:bg-[color:var(--app-accent-soft)] animate-fade-in cursor-pointer"
                  style={{
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-primary">
                        {item.title}
                      </p>
                      <p className="text-muted text-sm">
                        {item.company}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'shortlisted'
                          ? 'bg-success-soft text-success'
                          : item.status === 'applied'
                          ? 'bg-info-soft text-info'
                          : 'bg-danger-soft text-danger'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No data available"
            description="Start by taking an action to see data appear here."
            ctaText="Take Action"
            ctaAction={() => navigate('/action')}
          />
        )}

        {/* Secondary Actions */}
        <div className="mt-8 animate-fade-in">
          <Card padding>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Ready to explore?
              </h3>
              <p className="mb-4 text-muted">
                Discover more features and grow your presence.
              </p>
              <div className="flex gap-3 flex-col sm:flex-row justify-center">
                <Button variant="primary" onClick={() => navigate('/action')}>
                  Get Started
                </Button>
                <Button variant="outline" onClick={() => navigate('/learn')}>
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExampleDashboard;
