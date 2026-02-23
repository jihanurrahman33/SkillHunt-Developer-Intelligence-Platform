export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  innerClassName = '',
  padding = true,
}) {
  return (
    <div
      className={`
        rounded-lg border border-border bg-surface
        ${className}
      `}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            {title && (
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`${padding ? 'p-4' : ''} ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
