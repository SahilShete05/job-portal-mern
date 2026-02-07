import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  fullWidth = false,
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ring-accent focus:ring-offset-2 focus:ring-offset-[color:var(--app-bg)] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[color:var(--app-accent)] hover:brightness-110 text-white shadow-soft',
    secondary: 'bg-card hover:bg-[color:var(--app-accent-soft)] text-primary border border-subtle',
    danger: 'bg-[color:var(--app-danger)] hover:brightness-110 text-white shadow-soft',
    success: 'bg-[color:var(--app-success)] hover:brightness-110 text-white shadow-soft',
    outline: 'border border-[color:var(--app-border)] text-primary hover:bg-[color:var(--app-accent-soft)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {loading ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
