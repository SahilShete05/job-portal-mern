import React from 'react';

const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div
        className="rounded-lg p-6 bg-card border border-subtle shadow-card animate-pulse"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded bg-[color:var(--app-accent-soft)]" />
          <div className="h-6 w-48 rounded bg-[color:var(--app-accent-soft)]" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-[color:var(--app-accent-soft)]" />
          <div className="h-4 w-3/4 rounded bg-[color:var(--app-accent-soft)]" />
        </div>
      </div>

      {/* Card Skeleton */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg p-6 bg-card border border-subtle shadow-card animate-pulse"
        >
          <div className="h-6 w-32 rounded mb-4 bg-[color:var(--app-accent-soft)]" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded bg-[color:var(--app-accent-soft)]" />
            <div className="h-10 w-full rounded bg-[color:var(--app-accent-soft)]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileSkeleton;
