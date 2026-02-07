import React from 'react';

const StatCard = ({ label, value, icon: Icon, color = 'blue', isLoading = false }) => {
  const colorStyles = {
    blue: 'from-[color:var(--app-accent)] to-[color:var(--app-info)]',
    green: 'from-[color:var(--app-success)] to-[color:var(--app-success)]',
    red: 'from-[color:var(--app-danger)] to-[color:var(--app-danger)]',
    purple: 'from-[color:var(--app-info)] to-[color:var(--app-info)]',
  };

  if (isLoading) {
    return (
      <div className="rounded-lg p-6 h-32 animate-pulse bg-[color:var(--app-surface)]" />
    );
  }

  return (
    <div
      className="rounded-lg p-6 transition-all duration-200 hover:shadow-lg bg-card border border-subtle shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-2 text-muted"
          >
            {label}
          </p>
          <p
            className="text-3xl font-bold text-primary"
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`bg-gradient-to-br ${colorStyles[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
