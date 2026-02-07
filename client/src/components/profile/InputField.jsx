import React from 'react';

const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = null,
  helperText = null,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-muted">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg border transition-colors duration-200 bg-surface text-primary placeholder:text-muted focus:outline-none focus:ring-2 ring-accent focus:border-[color:var(--app-accent)] ${
          error ? 'border-danger-soft bg-danger-soft focus:ring-[color:var(--app-danger)]' : 'border-subtle'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="text-xs mt-1 text-danger">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs mt-1 text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default InputField;
