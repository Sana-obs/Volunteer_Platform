import { useMemo, useState } from "react";
import { ChevronDown, MapPin, SlidersHorizontal, Tag, Wrench } from "lucide-react";
import FilterSelect from "../ui/FilterSelect";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { getCategoryLabel } from "../../utils/categoryStyles";

export default function OpportunityFilterBar({
  governorates,
  selectedGovernorateId,
  onSelectGovernorate,
  categories,
  selectedCategoryId,
  onSelectCategory,
  skills,
  selectedSkillId,
  onSelectSkill,
  onClearAll,
  className = "",
}) {

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const locationOptions = useMemo(
    () => (governorates ?? []).map((governorate) => ({ value: governorate.id, label: governorate.nameEn })),
    [governorates],
  );

  
  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((category) => ({
        value: category.id,
        label: getCategoryLabel(category.name),
        count: category.opportunitiesCount,
      })),
    [categories],
  );

  const skillOptions = useMemo(
    () => (skills ?? []).map((skill) => ({ value: skill.id, label: skill.name })),
    [skills],
  );

  const activeCount = [
    governorates && selectedGovernorateId,
    categories && selectedCategoryId,
    skills && selectedSkillId,
  ].filter(Boolean).length;

  const renderFilterSelects = () => (
    <>
      {governorates ? (
        <FilterSelect
          label="Location"
          allLabel="All Locations"
          icon={MapPin}
          searchable
          searchPlaceholder="Search cities..."
          options={locationOptions}
          value={selectedGovernorateId}
          onSelect={onSelectGovernorate}
          className="w-full sm:w-60"
        />
      ) : null}

      {categories ? (
        <FilterSelect
          label="Category"
          allLabel="All Categories"
          icon={Tag}
          options={categoryOptions}
          value={selectedCategoryId}
          onSelect={onSelectCategory}
          className="w-full sm:w-56"
        />
      ) : null}

      {skills ? (
        <FilterSelect
          label="Skill"
          allLabel="All Skills"
          icon={Wrench}
          searchable
          searchPlaceholder="Search skills..."
          options={skillOptions}
          value={selectedSkillId}
          onSelect={onSelectSkill}
          className="w-full sm:w-56"
        />
      ) : null}
    </>
  );

  return (
    <div className={className}>
      <div className="hidden gap-3 sm:flex sm:flex-wrap sm:items-center">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-heading/50">
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters
          {activeCount > 0 ? (
            <span className="font-semibold text-primary">· {activeCount} active</span>
          ) : null}
        </span>
        {renderFilterSelects()}
      </div>

      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-haspopup="dialog"
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-heading/10 bg-field px-3.5 py-2 text-sm font-medium text-heading/70 transition-colors hover:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-heading/40" aria-hidden="true" />
          Filters
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown size={15} className="text-heading/40" aria-hidden="true" />
      </button>

      <Modal
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Filters"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onClearAll?.()}
              disabled={activeCount === 0}
              className="text-sm font-semibold text-heading/60 transition-colors hover:text-primary disabled:opacity-40 disabled:hover:text-heading/60"
            >
              Clear all
            </button>
            <Button onClick={() => setIsSheetOpen(false)}>Done</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">{renderFilterSelects()}</div>
      </Modal>
    </div>
  );
}
