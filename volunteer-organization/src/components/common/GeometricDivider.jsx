// Decorative divider between page sections.

export default function GeometricDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-20" aria-hidden="true">
      <span className="h-px flex-1 max-w-xs bg-heading/10" />
      <span className="w-2.5 h-2.5 rotate-45 bg-primary rounded-[2px]" />
      <span className="h-px flex-1 max-w-xs bg-heading/10" />
    </div>
  );
}