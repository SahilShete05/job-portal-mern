import React from 'react';

const ApplicationsChart = ({ applications = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="rounded-lg p-6 h-80 animate-pulse bg-[color:var(--app-surface)]" />
    );
  }

  // Group applications by month
  const monthlyData = {};
  applications.forEach((app) => {
    const date = new Date(app.appliedAt);
    const monthKey = date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  // Get last 6 months
  const months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    months.push({
      label: monthKey,
      count: monthlyData[monthKey] || 0,
    });
  }

  const maxCount = Math.max(...months.map((m) => m.count), 1);

  return (
    <div className="rounded-lg p-6 bg-card border border-subtle shadow-card">
      <h3 className="text-lg font-semibold mb-6 text-primary">
        Applications per Month
      </h3>

      <div className="space-y-4">
        {months.map((month, index) => {
          const percentage = (month.count / maxCount) * 100;
          return (
            <div key={index} className="flex items-end gap-4">
              <div className="w-16 text-sm font-medium text-muted">
                {month.label}
              </div>
              <div className="flex-1 flex items-end gap-2">
                <div className="flex-1 bg-[color:var(--app-accent-soft)] rounded-t h-12 overflow-hidden">
                  <div
                    className="bg-gradient-to-t from-[color:var(--app-accent)] to-[color:var(--app-info)] h-full transition-all duration-500 ease-out"
                    style={{
                      height: `${percentage}%`,
                      minHeight: month.count > 0 ? '8px' : '0px',
                    }}
                  />
                </div>
                <div
                  className="text-sm font-semibold w-8 text-right text-primary"
                >
                  {month.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationsChart;
