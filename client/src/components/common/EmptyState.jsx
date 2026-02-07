import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  ctaText, 
  ctaAction,
  imageUrl 
}) => {
  return (
    <div
      className="rounded-lg p-12 text-center animate-fade-in bg-card shadow-card border border-subtle"
    >
      {Icon && (
        <div className="mx-auto mb-4 p-4 rounded-full w-fit bg-[color:var(--app-accent-soft)]">
          <Icon
            size={48}
            className="text-muted"
          />
        </div>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Empty state"
          className="mx-auto mb-6 w-32 h-32 object-contain opacity-75"
        />
      )}

      <h3
        className="text-xl font-semibold mb-2 text-primary"
      >
        {title}
      </h3>

      <p className="mb-6 max-w-sm mx-auto text-muted">
        {description}
      </p>

      {ctaText && ctaAction && (
        <button
          onClick={ctaAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--app-accent)] hover:brightness-110 text-white font-semibold rounded-lg shadow-soft transition-all duration-200"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
