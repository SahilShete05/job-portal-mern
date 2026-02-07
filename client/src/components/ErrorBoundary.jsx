import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app flex items-center justify-center p-4">
          <div className="bg-card border border-subtle rounded-lg shadow-card p-8 max-w-md w-full">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-danger mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2M7.08 6.47A9 9 0 1012 21a9.005 9.005 0 004.92-14.53M9 9h.01M15 9h.01M9 15h.01M15 15h.01"
                />
              </svg>
              <h1 className="text-2xl font-bold text-primary mb-2">
                Something went wrong
              </h1>
              <p className="text-muted mb-6">
                We encountered an unexpected error. Please try again.
              </p>

              {import.meta?.env?.DEV && this.state.error && (
                <div className="bg-danger-soft border border-danger-soft rounded p-4 mb-6 text-left">
                  <p className="text-sm text-danger font-mono break-words">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 bg-[color:var(--app-accent)] text-white font-medium rounded-lg hover:brightness-110 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 px-4 py-2 bg-surface border border-subtle text-primary font-medium rounded-lg hover:bg-[color:var(--app-accent-soft)] transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
