import React from 'react';

const primaryStages = ['applied', 'shortlisted', 'interview', 'offered', 'hired'];
const terminalStages = ['rejected', 'withdrawn', 'closed'];

const StatusTimeline = ({ status }) => {
  const normalized = status?.toLowerCase();

  if (!normalized) {
    return null;
  }

  if (terminalStages.includes(normalized)) {
    return (
      <p className="text-xs text-muted">
        Status: <span className="font-semibold text-primary">{normalized}</span>
      </p>
    );
  }

  const currentIndex = primaryStages.indexOf(normalized);
  if (currentIndex === -1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-[10px] text-muted">
      {primaryStages.map((stage, index) => {
        const isActive = index <= currentIndex;
        return (
          <div key={stage} className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${isActive ? 'bg-[color:var(--app-accent)]' : 'bg-[color:var(--app-border)]'}`}
            />
            <span className={isActive ? 'text-primary' : 'text-muted'}>
              {stage}
            </span>
            {index < primaryStages.length - 1 && (
              <span className="mx-1 text-[color:var(--app-border)]">•</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
