import React from 'react';

/**
 * StatusBadge component for displaying application statuses
 * Supports: applied, shortlisted, rejected, pending, active, inactive
 */
const StatusBadge = ({ 
  status = 'applied', 
  size = 'md',
  variant = 'badge', // 'badge' or 'pill'
  className = '',
}) => {
  const statusConfig = {
    applied: {
      bgColor: 'bg-info-soft',
      textColor: 'text-info',
      borderColor: 'border-info-soft',
      icon: '📋',
      label: 'Applied',
    },
    shortlisted: {
      bgColor: 'bg-info-soft',
      textColor: 'text-info',
      borderColor: 'border-info-soft',
      icon: '✓',
      label: 'Shortlisted',
    },
    interview: {
      bgColor: 'bg-warning-soft',
      textColor: 'text-warning',
      borderColor: 'border-warning-soft',
      icon: '🗓️',
      label: 'Interview',
    },
    offered: {
      bgColor: 'bg-success-soft',
      textColor: 'text-success',
      borderColor: 'border-success-soft',
      icon: '🎉',
      label: 'Offered',
    },
    hired: {
      bgColor: 'bg-success-soft',
      textColor: 'text-success',
      borderColor: 'border-success-soft',
      icon: '🏆',
      label: 'Hired',
    },
    rejected: {
      bgColor: 'bg-danger-soft',
      textColor: 'text-danger',
      borderColor: 'border-danger-soft',
      icon: '✕',
      label: 'Rejected',
    },
    withdrawn: {
      bgColor: 'bg-danger-soft',
      textColor: 'text-danger',
      borderColor: 'border-danger-soft',
      icon: '↩',
      label: 'Withdrawn',
    },
    closed: {
      bgColor: 'bg-danger-soft',
      textColor: 'text-danger',
      borderColor: 'border-danger-soft',
      icon: '⛔',
      label: 'Closed',
    },
    pending: {
      bgColor: 'bg-warning-soft',
      textColor: 'text-warning',
      borderColor: 'border-warning-soft',
      icon: '⏳',
      label: 'Pending',
    },
    active: {
      bgColor: 'bg-success-soft',
      textColor: 'text-success',
      borderColor: 'border-success-soft',
      icon: '●',
      label: 'Active',
    },
    inactive: {
      bgColor: 'bg-danger-soft',
      textColor: 'text-danger',
      borderColor: 'border-danger-soft',
      icon: '○',
      label: 'Inactive',
    },
  };

  const config = statusConfig[status] || statusConfig.applied;

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const baseStyles = `inline-flex items-center gap-1.5 font-medium rounded-full border transition-all duration-200 ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeStyles[size]} ${className}`;

  if (variant === 'pill') {
    return (
      <span className={`${baseStyles} whitespace-nowrap`}>
        <span aria-hidden="true">{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span className={`${baseStyles} whitespace-nowrap`}>
      <span aria-hidden="true">{config.icon}</span>
      <span className="sr-only">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
