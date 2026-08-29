// Compact single-select filter popover (optional search for long lists).
// Comparison uses String() on both sides — the parent value is always a string
// (searchParams) but option.value can be numeric.

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import useClickOutside from "../../hooks/useClickOutside";

const OPTION_BASE =
  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors";

function FilterOption({ label, count, selected, onSelect }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`${OPTION_BASE} ${
        selected ? "bg-primary/10 font-semibold text-primary" : "text-heading/70 hover:bg-primary/5"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? (
        <span className="shrink-0 text-xs text-heading/45">({count})</span>
      ) : null}
      {selected ? <Check size={15} className="shrink-0" aria-hidden="true" /> : null}
    </button>
  );
}

export default function FilterSelect({
  label,
  allLabel = "All",
  icon: Icon = null,
  options = [],
  value = null,
  onSelect,
  searchable = false,
  searchPlaceholder = "Search...",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useClickOutside(isOpen, () => setIsOpen(false));

  const selectedOption = options.find((option) => String(option.value) === String(value)) || null;
  const isActive = Boolean(selectedOption);

  const visibleOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const normalized = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, searchable, query]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
  };

  const handleSelect = (nextValue) => {
    onSelect(nextValue);
    close();
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          isActive
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-heading/10 bg-field text-heading/70 hover:border-primary/30"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon
              size={15}
              className={`shrink-0 ${isActive ? "text-primary" : "text-heading/40"}`}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate">
            <span className="font-normal text-heading/45">{label}: </span>
            <span className={isActive ? "font-medium" : ""}>
              {selectedOption ? selectedOption.label : allLabel}
            </span>
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-heading/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
          className="absolute left-0 z-30 mt-2 w-full min-w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-heading/10 bg-field shadow-lg"
        >
          {searchable ? (
            <div className="border-b border-heading/10 p-2">
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-heading/40"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={`Search ${label.toLowerCase()}`}
                  className="w-full rounded-lg bg-canvas py-2 pl-8 pr-2 text-sm text-heading placeholder-body/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          ) : null}

          <ul role="listbox" aria-label={label} className="max-h-60 space-y-0.5 overflow-y-auto p-1.5">
            <li>
              <FilterOption label={allLabel} selected={!isActive} onSelect={() => handleSelect(null)} />
            </li>

            {visibleOptions.map((option) => (
              <li key={option.value}>
                <FilterOption
                  label={option.label}
                  count={option.count}
                  selected={String(option.value) === String(value)}
                  onSelect={() => handleSelect(option.value)}
                />
              </li>
            ))}

            {searchable && visibleOptions.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-heading/45">No matches</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
