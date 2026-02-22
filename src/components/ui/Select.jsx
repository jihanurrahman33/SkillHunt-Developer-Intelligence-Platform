'use client';

import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder = 'Select...',
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full rounded-md border border-border bg-surface px-3 py-2 text-sm
          text-foreground
          transition-colors duration-150
          focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
});

export default Select;
