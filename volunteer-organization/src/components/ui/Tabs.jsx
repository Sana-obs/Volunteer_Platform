// Segmented-control tabs. Parent owns the active tab; className goes on the outer wrapper.

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  ariaLabel = "View",
  className = "",
}) {
  return (
    <div className={`mb-6 ${className}`}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex w-fit flex-wrap gap-2 rounded-2xl border border-heading/10 bg-heading/5 p-1"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex min-h-11 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                isActive
                  ? "bg-primary font-semibold text-white shadow-sm"
                  : "font-medium text-heading/55 hover:bg-heading/10 hover:text-heading"
              }`}
            >
              {Icon ? (
                <Icon
                  size={15}
                  className={
                    isActive
                      ? "text-white"
                      : "text-heading/40"
                  }
                  aria-hidden="true"
                />
              ) : null}

              {tab.label}

              {typeof tab.count === "number" ? (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-heading/10 text-heading/50"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
