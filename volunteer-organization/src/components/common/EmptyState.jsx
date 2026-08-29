import Button from "../ui/Button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  // admin dark variant — default heading/body colors are near-invisible on dark
  dark = false,
}) {
  const titleColor = dark ? 'text-adminTextHi' : 'text-heading'
  const descriptionColor = dark ? 'text-adminTextLo' : 'text-body'

  return (
    <div className="flex flex-col items-center text-center gap-5 py-20 px-6">
      
      {Icon && (
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Decorative backdrop behind the icon */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 96 96"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="48" cy="48" r="48" className="fill-primary/10" />
            <circle cx="80" cy="18" r="5" className="fill-primary/10" />
            <circle cx="14" cy="78" r="4" className="fill-primary/10" />
          </svg>

          <Icon size={30} className="relative text-primary" aria-hidden="true" />
        </div>
      )}

      <h3 className={`font-semibold ${titleColor} text-lg`}>{title}</h3>

      {description && (
        <p className={`text-sm ${descriptionColor} max-w-sm leading-relaxed`}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="medium" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}