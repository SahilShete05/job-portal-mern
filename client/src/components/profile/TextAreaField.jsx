import React from 'react';

const TextAreaField = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = null,
  rows = 4,
  helperText = null,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-muted">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2 rounded-lg border transition-colors duration-200 resize-none bg-surface text-primary placeholder:text-muted focus:outline-none focus:ring-2 ring-accent focus:border-[color:var(--app-accent)] ${
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

export default TextAreaField;
