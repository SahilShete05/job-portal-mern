import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 transition-colors duration-300">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[color:var(--app-accent)] mb-4">404</h1>
          <h2 className="text-4xl font-bold text-primary mb-2">Page Not Found</h2>
          <p className="text-muted text-lg mb-8">
            Sorry, the page you're looking for doesn't exist.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="inline-block px-8 py-3 bg-[color:var(--app-accent)] hover:brightness-110 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Go Home
          </button>
          <div className="mt-4">
            <button
              onClick={() => navigate('/jobs')}
              className="inline-block px-8 py-3 bg-surface border border-subtle text-primary font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ml-4"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
