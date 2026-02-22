'use client';

import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon,
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
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-md border border-border bg-surface px-3 py-2 text-sm
            text-foreground placeholder:text-muted-foreground
            transition-colors duration-150
            focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
            disabled:cursor-not-allowed disabled:opacity-50
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
});

export default Input;
