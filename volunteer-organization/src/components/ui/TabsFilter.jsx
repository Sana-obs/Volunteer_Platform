// Vertical filter-tab rail: always visible on md+, collapsible on small screens.

import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";

// Semantic badge colors (gold/green/red/gray family), matching PARTICIPATION_STATUS_META.
const BADGE_COLOR_CLASSES = {
  neutral: "bg-heading/10 text-heading/60",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
};

export default function TabsFilter({ tabs, activeTab, onTabChange, ariaLabel = "Filter" }) {
  // Small-screen collapse only; on md+ the list is always shown.
  const [isExpanded, setIsExpanded] = useState(false);
  const listId = useId();

  // roving tabindex — manual focus control for arrow-key navigation
  const tabButtonsRef = useRef(new Map());
  const focusTabById = (id) => {
    tabButtonsRef.current.get(id)?.focus();
  };

  const selectTab = (id) => {
    onTabChange(id);
    setIsExpanded(false);
  };

  // Automatic activation: arrows move focus and switch the active tab. Vertical only.
  const handleKeyDown = (event, index) => {
    let nextIndex;

    if (event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    selectTab(nextTab.id);
    focusTabById(nextTab.id);
  };

  const activeTabDef = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const ActiveIcon = activeTabDef?.icon;

  // Visual divider before the last two tabs — positional only, no id/name coupling.
  const dividerIndex = tabs.length > 2 ? tabs.length - 2 : -1;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls={listId}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-heading/10 bg-field px-4 py-3 text-sm font-medium text-heading transition-colors hover:bg-heading/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {ActiveIcon ? <ActiveIcon size={15} className="shrink-0 text-primary" aria-hidden="true" /> : null}
          <span className="truncate">
            {activeTabDef?.label}
            {typeof activeTabDef?.count === "number" ? ` (${activeTabDef.count})` : ""}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-heading/50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* grid-rows 0fr→1fr height transition without JS measurement; always open on md+ */}
      <div
        className={`grid transition-all duration-300 ease-in-out md:grid-rows-[1fr] md:opacity-100 ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            id={listId}
            role="tablist"
            aria-orientation="vertical"
            aria-label={ariaLabel}
            // matches the Categories panel on Explore Opportunities
            className={`${PANEL_SURFACE} flex w-full flex-col gap-1 p-5`}
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const badgeClass = BADGE_COLOR_CLASSES[tab.colorVariant] || BADGE_COLOR_CLASSES.neutral;

              return (
                <div key={tab.id}>
                  {index === dividerIndex && <div className="my-2 border-t border-heading/10" aria-hidden="true" />}

                  <button
                    ref={(node) => {
                      if (node) tabButtonsRef.current.set(tab.id, node);
                      else tabButtonsRef.current.delete(tab.id);
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onClick={() => selectTab(tab.id)}
                    className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isActive ? "bg-primary/10 text-primary" : "text-heading/60 hover:bg-primary/5 hover:text-heading"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      {Icon ? <Icon size={15} className="shrink-0" aria-hidden="true" /> : null}
                      <span className="truncate">{tab.label}</span>
                    </span>

                    {typeof tab.count === "number" ? (
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                        {tab.count}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
