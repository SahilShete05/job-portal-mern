import React from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    applied: {
      bg: 'bg-info-soft border border-info-soft',
      text: 'text-info',
      label: 'Applied',
    },
    shortlisted: {
      bg: 'bg-info-soft border border-info-soft',
      text: 'text-info',
      label: 'Shortlisted',
    },
    interview: {
      bg: 'bg-warning-soft border border-warning-soft',
      text: 'text-warning',
      label: 'Interview',
    },
    offered: {
      bg: 'bg-success-soft border border-success-soft',
      text: 'text-success',
      label: 'Offered',
    },
    hired: {
      bg: 'bg-success-soft border border-success-soft',
      text: 'text-success',
      label: 'Hired',
    },
    withdrawn: {
      bg: 'bg-danger-soft border border-danger-soft',
      text: 'text-danger',
      label: 'Withdrawn',
    },
    closed: {
      bg: 'bg-danger-soft border border-danger-soft',
      text: 'text-danger',
      label: 'Closed',
    },
    rejected: {
      bg: 'bg-danger-soft border border-danger-soft',
      text: 'text-danger',
      label: 'Rejected',
    },
  };

  const normalizedStatus = status?.toLowerCase();
  const aliasMap = {
    pending: 'applied',
    accepted: 'shortlisted',
  };

  const style = statusStyles[aliasMap[normalizedStatus] || normalizedStatus] || statusStyles.applied;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
};

export default StatusBadge;
