export default function KPICard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className = '',
}) {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-muted-foreground',
  };

  return (
    <div
      className={`
        rounded-lg border border-border bg-surface p-4
        transition-colors duration-150 hover:bg-surface-hover
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {icon && (
          <span className="text-muted-foreground">{icon}</span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {change && (
        <p className={`mt-1 text-xs ${changeColors[changeType]}`}>
          {change}
        </p>
      )}
    </div>
  );
}
