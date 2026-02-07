import React from 'react';
import { Link } from 'react-router-dom';

const Home = React.memo(() => {
  return (
    <div className="min-h-screen bg-app transition-colors duration-300">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Welcome to Job Portal
          </h1>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Find your next opportunity or connect with talented professionals
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/jobs"
              className="px-8 py-3 bg-[color:var(--app-accent)] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-card"
            >
              Browse Jobs
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-card border border-subtle text-primary font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-card"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-surface border border-subtle text-primary font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-card"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-subtle rounded-lg shadow-card p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-primary mb-2">Find Jobs</h3>
              <p className="text-muted">
                Search and apply to thousands of job opportunities
              </p>
            </div>

            <div className="bg-card border border-subtle rounded-lg shadow-card p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-primary mb-2">Track Applications</h3>
              <p className="text-muted">
                Monitor your application status in real-time
              </p>
            </div>

            <div className="bg-card border border-subtle rounded-lg shadow-card p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-primary mb-2">Manage Candidates</h3>
              <p className="text-muted">
                Post jobs and manage applicants efficiently
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
