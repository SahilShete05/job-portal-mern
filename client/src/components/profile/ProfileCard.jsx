import React from 'react';

const ProfileCard = ({ title, children, icon: Icon }) => {
  return (
    <div
      className="rounded-lg p-6 border border-subtle bg-card shadow-card"
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <Icon
            size={24}
            className="text-[color:var(--app-accent)]"
          />
        )}
        <h2
          className="text-lg font-bold text-primary"
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

export default ProfileCard;
