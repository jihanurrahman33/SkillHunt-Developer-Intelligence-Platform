'use client';

import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-surface-hover border border-border',
  danger:
    'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20',
  ghost:
    'text-secondary-foreground hover:bg-surface-hover hover:text-foreground',
  outline:
    'border border-border text-foreground hover:bg-surface-hover',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

export default Button;
