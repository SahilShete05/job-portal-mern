import React from 'react';

/**
 * Enhanced StatCard with professional animations and styling
 * Usage: <StatCard label="Total" value={100} icon={Icon} color="blue" />
 */
const EnhancedStatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue', 
  isLoading = false,
  trend = null, // { value: 5, direction: 'up' }
}) => {
  const colorStyles = {
    blue: 'from-[color:var(--app-accent)] to-[color:var(--app-info)]',
    green: 'from-[color:var(--app-success)] to-[color:var(--app-success)]',
    red: 'from-[color:var(--app-danger)] to-[color:var(--app-danger)]',
    purple: 'from-[color:var(--app-info)] to-[color:var(--app-info)]',
    yellow: 'from-[color:var(--app-warning)] to-[color:var(--app-warning)]',
  };

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-6 h-32 animate-pulse bg-[color:var(--app-surface)]"
      />
    );
  }

  return (
    <div
      className="rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 transform bg-card border border-subtle shadow-card animate-fade-in"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-2 text-muted"
          >
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p
              className="text-3xl font-bold text-primary"
            >
              {value}
            </p>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.direction === 'up'
                    ? 'text-success'
                    : 'text-danger'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`bg-gradient-to-br ${colorStyles[color]} p-3 rounded-lg shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedStatCard;
