import React from 'react';

/**
 * Enhanced Table component with smooth animations and hover effects
 * Provides consistent styling across all data tables in the app
 */
const EnhancedTable = ({
  columns,
  rows = [],
  isLoading = false,
  skeleton = null, // Pass <SkeletonLoader count={5} type="table-row" />
  onRowClick,
}) => {
  if (isLoading && skeleton) {
    return (
      <div className="rounded-lg overflow-hidden bg-card border border-subtle shadow-card">
        <table className="w-full">
          <thead className="bg-[color:var(--app-surface)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-sm font-semibold text-primary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{skeleton}</tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg p-12 text-center bg-card border border-subtle shadow-card">
        <p className="text-lg font-semibold mb-2 text-primary">
          No data available
        </p>
        <p className="text-muted">
          No records found to display
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden bg-card shadow-card border border-subtle">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[color:var(--app-surface)]">
            <tr className="border-b border-subtle">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-primary"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-subtle transition-all duration-200 hover:bg-[color:var(--app-accent-soft)] ${
                  onRowClick ? 'cursor-pointer' : ''
                } animate-fade-in`}
                style={{
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                {columns.map((col) => (
                  <td
                    key={`${row.id}-${col.key}`}
                    className="px-6 py-4 text-sm text-primary"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnhancedTable;
