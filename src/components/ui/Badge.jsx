const variantStyles = {
  new: 'bg-status-new/15 text-status-new border-status-new/20',
  contacted: 'bg-status-contacted/15 text-status-contacted border-status-contacted/20',
  interviewing: 'bg-status-interviewing/15 text-status-interviewing border-status-interviewing/20',
  hired: 'bg-status-hired/15 text-status-hired border-status-hired/20',
  rejected: 'bg-status-rejected/15 text-status-rejected border-status-rejected/20',
  default: 'bg-muted text-muted-foreground border-border',
  info: 'bg-info/15 text-info border-info/20',
  success: 'bg-success/15 text-success border-success/20',
  warning: 'bg-warning/15 text-warning border-warning/20',
  danger: 'bg-danger/15 text-danger border-danger/20',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${variantStyles[variant] || variantStyles.default}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
