// Category-grouped multi-select for skills, shared by the profile and cause forms.

import { useEffect, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import Skeleton from "../ui/Skeleton";
import Typography from "../ui/Typography";
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CATEGORY_SELECTED_COLORS,
  getCategoryLabel,
  getSkillCategoryName,
} from "../../utils/categoryStyles";

export default function SkillsSelector({
  control,
  name = "skills",
  availableSkills = [],
  loading = false,
  error,
  helperText = "Select at least one skill — these also shape the interests shown on your profile.",
}) {
  // Also drives the initial collapse state below.
  const grouped = availableSkills.reduce((acc, skill) => {
    const category = getSkillCategoryName(skill);
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  // Only for the initial collapse calc; Controller's field.value drives rendering.
  const currentValue = useWatch({ control, name, defaultValue: [] });

  // Categories with no prior selection start collapsed.
  const [collapsedCategories, setCollapsedCategories] = useState(() => new Set());

  // Skills usually arrive after first render — apply the initial collapse once
  // they do, and only once, so later manual toggles aren't overridden.
  const hasAppliedInitialCollapse = useRef(false);
  useEffect(() => {
    if (hasAppliedInitialCollapse.current || loading || availableSkills.length === 0) return;

    hasAppliedInitialCollapse.current = true;
    const hasAnySelection = (currentValue || []).length > 0;

    setCollapsedCategories(() => {
      const next = new Set();
      Object.entries(grouped).forEach(([category, skills], index) => {
        // Nothing selected yet — open only the first category as a hint.
        if (!hasAnySelection) {
          if (index !== 0) next.add(category);
          return;
        }

        const hasSelection = skills.some((skill) => (currentValue || []).includes(skill.id));
        if (!hasSelection) next.add(category);
      });
      return next;
    });
    // Runs only when skills finish loading, not on every selection change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, availableSkills]);

  const toggleCategory = (category) => {
    setCollapsedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex} className="rounded-xl border border-heading/10 bg-field p-4">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, chipIndex) => (
                <Skeleton key={chipIndex} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {helperText && (
        <Typography variant="caption" color="muted">
          {helperText}
        </Typography>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field: { value = [], onChange } }) => {
          return (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, skills]) => {
                const Icon = CATEGORY_ICONS[category];
                const color = CATEGORY_COLORS[category];
                const selectedCount = skills.filter((skill) => value.includes(skill.id)).length;
                const isCollapsed = collapsedCategories.has(category);

                return (
                  <div
                    key={category}
                    className="rounded-xl border border-heading/10 bg-field p-4"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      aria-expanded={!isCollapsed}
                      className="mb-3 flex w-full items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md border ${color}`}
                      >
                        {Icon && <Icon size={14} />}
                        {getCategoryLabel(category)}
                      </span>
                      {selectedCount > 0 && (
                        <span className="text-xs font-medium text-primary">
                          {selectedCount} selected
                        </span>
                      )}
                      <div className="h-px flex-1 bg-heading/10"></div>
                      <ChevronDown
                        size={16}
                        className={`text-heading/40 transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                        aria-hidden="true"
                      />
                    </button>

                    {!isCollapsed && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => {
                          const isSelected = value.includes(skill.id);
                          const selectedClass =
                            CATEGORY_SELECTED_COLORS[category] ||
                            "bg-primary text-bg border-primary";

                          return (
                            <button
                              key={skill.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() =>
                                onChange(
                                  isSelected
                                    ? value.filter((id) => id !== skill.id)
                                    : [...value, skill.id],
                                )
                              }
                              className={`px-3 py-1.5 rounded-full text-xs border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                                isSelected
                                  ? selectedClass
                                  : "bg-field text-heading/70 border-heading/15 hover:border-primary/50"
                              }`}
                            >
                              {skill.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }}
      />

      {error && (
        <Typography variant="caption" color="danger">
          {error}
        </Typography>
      )}
    </div>
  );
}