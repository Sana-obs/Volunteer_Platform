import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Target, SearchX, Loader2, Search } from "lucide-react";
import Typography from "../../components/ui/Typography";
import Input from "../../components/ui/Input";
import OpportunityCard from "../../components/opportunity/OpportunityCard";
import OpportunityFilterBar from "../../components/opportunity/OpportunityFilterBar";
import FilterFab from "../../components/opportunity/FilterFab";
import ActiveFilterChips from "../../components/opportunity/ActiveFilterChips";
import OpportunityTabs from "../../components/opportunity/OpportunityTabs";
import { OPPORTUNITY_TABS } from "../../constants/opportunityTabs";
import CardSkeleton from "../../components/ui/CardSkeleton";
import EmptyState from "../../components/common/EmptyState";
import AuthAlert from "../../components/auth/AuthAlert";
import { useCategoriesQuery } from "../../hooks/queries/useCategoriesQuery";
import { useCitiesQuery } from "../../hooks/queries/useCitiesQuery";
import { useSkillsQuery } from "../../hooks/queries/useSkillsQuery";
import { useOpportunitiesQuery } from "../../hooks/queries/useOpportunitiesQuery";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useVirtualizedGrid } from "../../hooks/useVirtualizedGrid";
import { useAuth } from "../../hooks/useAuth";
import { ACCOUNT_TYPES } from "../../constants/auth/accountTypes";
import { OPPORTUNITY_STATUS, OPPORTUNITY_STATUS_META } from "../../constants/opportunityStatus";
import { ROUTES } from "../../constants/paths";
import { matchesFilters } from "../../services/opportunities";
import { getGovernorateSelectValue } from "../../services/syrianGovernorates";
import { getCategoryLabel } from "../../utils/categoryStyles";

const EMPTY_LIST = [];

// Initial row height estimate; useVirtualizedGrid adjusts it after measuring the rendered row.
const ESTIMATED_OPPORTUNITY_ROW_HEIGHT = 460;

// Must match the grid classes used below.
const OPPORTUNITY_GRID_BREAKPOINTS = [
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];

export default function OpportunitiesListPage() {
  const navigate = useNavigate();
  const { isAuthenticated, accountType, user } = useAuth();
  const isVolunteer = isAuthenticated && accountType === ACCOUNT_TYPES.VOLUNTEER;

  // Used by FilterFab to scroll back to the filter section.
  const filterSectionRef = useRef(null);

  // URL parameters are the source of truth for the main filters.
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategoryId = searchParams.get("categories") || null;
  const selectedGovernorateId = searchParams.get("governorate") || null;
  const selectedSkillId = searchParams.get("skill") || null;
  const selectedStatus = searchParams.get("status") || null;
  const search = searchParams.get("q") || "";

  const updateParam = useCallback(
    (key, value) => {
      setSearchParams(
        (params) => {
          if (value) params.set(key, value);
          else params.delete(key);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearch = (value) => updateParam("q", value);

  // Each main filter allows one selected value and toggles off when selected again.
  const selectCategory = (id) =>
    updateParam("categories", String(selectedCategoryId) === String(id) ? "" : id);

  const selectGovernorate = (id) =>
    updateParam("governorate", String(selectedGovernorateId) === String(id) ? "" : id);

  const selectSkill = (id) =>
    updateParam("skill", String(selectedSkillId) === String(id) ? "" : id);

  // Suggested filters are local because the suggested list is fetched once and filtered client-side.
  const [activeTab, setActiveTab] = useState(OPPORTUNITY_TABS.ALL);
  const isSuggestedTab = isVolunteer && activeTab === OPPORTUNITY_TABS.SUGGESTED;

  const [suggestedCategoryId, setSuggestedCategoryId] = useState(null);
  const [suggestedGovernorateId, setSuggestedGovernorateId] = useState(null);
  const [suggestedSkillId, setSuggestedSkillId] = useState(null);

  const toggleSuggestedCategory = (id) =>
    setSuggestedCategoryId((current) => (String(current) === String(id) ? null : id));

  const toggleSuggestedGovernorate = (id) =>
    setSuggestedGovernorateId((current) => (String(current) === String(id) ? null : id));

  const toggleSuggestedSkill = (id) =>
    setSuggestedSkillId((current) => (String(current) === String(id) ? null : id));

  // Debounces search input for both tabs.
  const debouncedSearch = useDebouncedValue(search, 300);

  const categoriesQuery = useCategoriesQuery();
  const citiesQuery = useCitiesQuery();
  const skillsQuery = useSkillsQuery();

  const categories = categoriesQuery.data ?? [];
  const governorates = useMemo(() => citiesQuery.data ?? [], [citiesQuery.data]);
  const skills = skillsQuery.data ?? [];

  // Converts a governorate ID into the location value expected by the opportunity data/API.
  const governorateIdToLocation = useCallback(
    (governorateId) => {
      const governorate = governorates.find(
        (item) => String(item.id) === String(governorateId),
      );

      return governorate ? getGovernorateSelectValue(governorate.nameEn) : "";
    },
    [governorates],
  );

  const opportunitiesQuery = useOpportunitiesQuery({
    isSuggestedTab,
    search: debouncedSearch,
    categoryId: selectedCategoryId || "",
    skillId: selectedSkillId || "",
    location: governorateIdToLocation(selectedGovernorateId),
    status: selectedStatus || "",
    user,
  });

  const opportunities = opportunitiesQuery.data;

  // Show open opportunities by default.
  // A status in the URL explicitly requests another status, such as completed opportunities.
  const visibleOpportunities = useMemo(() => {
    if (!Array.isArray(opportunities)) return [];

    const scoped = selectedStatus
      ? opportunities.filter((opportunity) => opportunity.status === selectedStatus)
      : opportunities.filter(
          (opportunity) =>
            opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_OPEN,
        );

    // Suggested opportunities keep their recommendation order and are filtered locally.
    if (isSuggestedTab) {
      return scoped.filter((opportunity) =>
        matchesFilters(opportunity, {
          search: debouncedSearch,
          categoryId: suggestedCategoryId || "",
          skillId: suggestedSkillId || "",
          location: governorateIdToLocation(suggestedGovernorateId),
        }),
      );
    }

    // Open opportunities are sorted by registration deadline.
    // Past opportunities are sorted by most recent end date.
    const isPastStatus =
      selectedStatus === OPPORTUNITY_STATUS.COMPLETED ||
      selectedStatus === OPPORTUNITY_STATUS.IN_PROGRESS;

    return [...scoped].sort((a, b) =>
      isPastStatus
        ? new Date(b.endDate) - new Date(a.endDate)
        : new Date(a.registerEndAt) - new Date(b.registerEndAt),
    );
  }, [
    opportunities,
    selectedStatus,
    isSuggestedTab,
    debouncedSearch,
    suggestedCategoryId,
    suggestedSkillId,
    suggestedGovernorateId,
    governorateIdToLocation,
  ]);

  const isInitialLoading = opportunitiesQuery.isPending;
  const isRefetching = opportunitiesQuery.isFetching && !isInitialLoading;

  const error = opportunitiesQuery.isError
    ? opportunitiesQuery.error?.message || "Failed to load opportunities"
    : "";

  const resultsLabel = useMemo(() => {
    const count = visibleOpportunities.length;
    return `${count} opportunit${count === 1 ? "y" : "ies"} found`;
  }, [visibleOpportunities.length]);

  // Active filter chips use URL state on All and local state on Suggested.
  const activeCategoryId = isSuggestedTab ? suggestedCategoryId : selectedCategoryId;
  const activeGovernorateId = isSuggestedTab
    ? suggestedGovernorateId
    : selectedGovernorateId;
  const activeSkillId = isSuggestedTab ? suggestedSkillId : selectedSkillId;

  const activeFilters = [];

  const activeGovernorate = governorates.find(
    (item) => String(item.id) === String(activeGovernorateId),
  );

  if (activeGovernorate) {
    activeFilters.push({
      key: "governorate",
      label: activeGovernorate.nameEn,
      onRemove: isSuggestedTab
        ? () => setSuggestedGovernorateId(null)
        : () => selectGovernorate(null),
    });
  }

  const activeCategory = categories.find(
    (item) => String(item.id) === String(activeCategoryId),
  );

  if (activeCategory) {
    activeFilters.push({
      key: "category",
      label: getCategoryLabel(activeCategory.name),
      onRemove: isSuggestedTab
        ? () => setSuggestedCategoryId(null)
        : () => selectCategory(null),
    });
  }

  const activeSkill = skills.find(
    (item) => String(item.id) === String(activeSkillId),
  );

  if (activeSkill) {
    activeFilters.push({
      key: "skill",
      label: activeSkill.name,
      onRemove: isSuggestedTab
        ? () => setSuggestedSkillId(null)
        : () => selectSkill(null),
    });
  }

  // Status is available only through the URL on the All tab.
  if (!isSuggestedTab && selectedStatus && OPPORTUNITY_STATUS_META[selectedStatus]) {
    activeFilters.push({
      key: "status",
      label: OPPORTUNITY_STATUS_META[selectedStatus].label,
      onRemove: () => updateParam("status", ""),
    });
  }

  const clearAllFilters = () => {
    if (isSuggestedTab) {
      setSuggestedGovernorateId(null);
      setSuggestedCategoryId(null);
      setSuggestedSkillId(null);
      return;
    }

    setSearchParams(
      (params) => {
        params.delete("governorate");
        params.delete("categories");
        params.delete("skill");
        params.delete("status");
        return params;
      },
      { replace: true },
    );
  };

  // Group suggested opportunities by their recommendation reason.
  const groupedByReason = useMemo(() => {
    if (!isSuggestedTab) return [];

    const groups = new Map();

    visibleOpportunities.forEach((opportunity) => {
      const reasonName = opportunity.matchReason || "Recommended for you";

      if (!groups.has(reasonName)) groups.set(reasonName, []);
      groups.get(reasonName).push(opportunity);
    });

    return Array.from(groups.entries());
  }, [isSuggestedTab, visibleOpportunities]);

  // Virtualization is used only for the regular All tab.
  const gridOpportunities = isSuggestedTab ? EMPTY_LIST : visibleOpportunities;

  const {
    isVirtualized,
    containerRef: virtualizedContainerRef,
    totalSize: virtualizedTotalSize,
    virtualRows,
  } = useVirtualizedGrid({
    items: gridOpportunities,
    estimateRowHeight: ESTIMATED_OPPORTUNITY_ROW_HEIGHT,
    breakpoints: OPPORTUNITY_GRID_BREAKPOINTS,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Typography variant="sectionTitle" className="mb-2">
        Volunteering Opportunities
      </Typography>

      <Typography variant="body" className="mb-8 max-w-2xl text-body">
        Find a cause that matches your skills and availability.
      </Typography>

      {isVolunteer ? (
        <div className="sticky top-19.75 z-40 bg-canvas pb-3 mb-4">
          <OpportunityTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-0!"
          />
        </div>
      ) : null}

      <div className="mb-5">
        <Input
          name="opportunity-search"
          placeholder="Search opportunities..."
          icon={Search}
          variant="filled"
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div
        ref={filterSectionRef}
        className="mb-8 border-b border-heading/10 pb-6"
      >
        <OpportunityFilterBar
          governorates={governorates}
          selectedGovernorateId={
            isSuggestedTab ? suggestedGovernorateId : selectedGovernorateId
          }
          onSelectGovernorate={
            isSuggestedTab ? toggleSuggestedGovernorate : selectGovernorate
          }
          categories={categories}
          selectedCategoryId={
            isSuggestedTab ? suggestedCategoryId : selectedCategoryId
          }
          onSelectCategory={
            isSuggestedTab ? toggleSuggestedCategory : selectCategory
          }
          skills={skills}
          selectedSkillId={isSuggestedTab ? suggestedSkillId : selectedSkillId}
          onSelectSkill={isSuggestedTab ? toggleSuggestedSkill : selectSkill}
          onClearAll={clearAllFilters}
        />
      </div>

      <div>
        {!isInitialLoading ? (
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <p className="text-sm text-heading/50 flex items-center gap-2">
              {resultsLabel}

              {isRefetching ? (
                <Loader2
                  size={14}
                  className="animate-spin text-heading/30"
                  aria-hidden="true"
                />
              ) : null}
            </p>
          </div>
        ) : null}

        {isSuggestedTab ? (
          <div className="flex items-start gap-3 rounded-3xl bg-primary/5 border border-primary/15 p-4 mb-6">
            <Target
              size={18}
              className="text-primary shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm text-heading/70">
              Picked for you based on your skills and city.
            </p>
          </div>
        ) : null}

        <ActiveFilterChips
          filters={activeFilters}
          onClearAll={clearAllFilters}
        />

        {isInitialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <AuthAlert variant="error">{error}</AuthAlert>
        ) : visibleOpportunities.length === 0 ? (
          <EmptyState
            icon={isSuggestedTab ? Target : SearchX}
            title={
              isSuggestedTab
                ? "No recommended opportunities yet"
                : "No opportunities found"
            }
            description={
              isSuggestedTab
                ? "Update your profile details to get better matches."
                : "Try a different search term or category."
            }
            actionLabel={isSuggestedTab ? "Update Profile" : undefined}
            onAction={
              isSuggestedTab
                ? () => navigate(ROUTES.VOLUNTEER_PROFILE)
                : undefined
            }
          />
        ) : isSuggestedTab ? (
          <div className="flex flex-col gap-10">
            {groupedByReason.map(([reasonName, reasonOpportunities]) => (
              <section key={reasonName}>
                <Typography variant="h4" className="mb-4">
                  {reasonName}
                </Typography>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reasonOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      recommended
                      showMatchReason={false}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : isVirtualized ? (
          <div
            ref={virtualizedContainerRef}
            role="list"
            aria-label="Opportunities"
            style={{
              position: "relative",
              height: virtualizedTotalSize,
              width: "100%",
            }}
          >
            {virtualRows.map((row) => (
              <div
                key={row.key}
                ref={row.measureRef}
                role="presentation"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${row.start}px)`,
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {row.items.map((opportunity, index) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    role="listitem"
                    aria-posinset={row.startIndex + index + 1}
                    aria-setsize={visibleOpportunities.length}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity">
            {visibleOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
              />
            ))}
          </div>
        )}
      </div>

      <FilterFab
        targetRef={filterSectionRef}
        activeCount={activeFilters.length}
        stickyOffset={isVolunteer ? 140 : 84}
      />
    </div>
  );
}
