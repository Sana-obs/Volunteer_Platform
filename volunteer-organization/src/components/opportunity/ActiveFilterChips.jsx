import { X } from "lucide-react";
import Chip from "../ui/Chip";

export default function ActiveFilterChips({ filters, onClearAll }) {
  if (!filters.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {filters.map((filter) => (
        <Chip key={filter.key} color="primary" className="inline-flex items-center gap-1.5 pr-2">
          {filter.label}
          <button
            type="button"
            onClick={filter.onRemove}
            aria-label={`Remove ${filter.label} filter`}
            className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </Chip>
      ))}

      {filters.length > 1 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="px-2 text-xs font-semibold text-heading/50 transition-colors hover:text-primary"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
