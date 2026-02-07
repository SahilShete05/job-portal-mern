import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
}) => {
  // Define variant styles
  const variantStyles = {
    primary:
      'bg-[color:var(--app-accent)] hover:brightness-110 text-white shadow-soft',
    secondary:
      'bg-card hover:bg-[color:var(--app-accent-soft)] text-primary border border-subtle',
    success:
      'bg-[color:var(--app-success)] hover:brightness-110 text-white shadow-soft',
    danger:
      'bg-[color:var(--app-danger)] hover:brightness-110 text-white shadow-soft',
    outline:
      'border border-[color:var(--app-border)] text-primary hover:bg-[color:var(--app-accent-soft)]',
  };

  // Define size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseStyles =
    'font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ring-accent focus:ring-offset-2 focus:ring-offset-[color:var(--app-bg)] disabled:opacity-50 disabled:cursor-not-allowed';

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={finalClassName}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {Icon ? <Icon size={18} /> : null}
          {children}
        </span>
      )}
    </button>
  );
};

export default Button;
