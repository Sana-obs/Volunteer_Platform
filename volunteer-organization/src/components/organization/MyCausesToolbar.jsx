import { Search } from "lucide-react";
import Input from "../ui/Input";
import Dropdown from "../ui/Dropdown";
import { CAUSE_STATUS_FILTERS, CAUSE_SORT_OPTIONS } from "../../constants/causeFilters";

export default function MyCausesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}) {
  return (
    <div className="sticky top-19.75 z-40 flex flex-col gap-3 bg-canvas py-3 sm:flex-row mb-6">
      <Input
        name="causeSearch"
        placeholder="Search by cause title..."
        aria-label="Search causes by title"
        icon={Search}
        fullWidth
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="sm:flex-1"
      />

      <div className="flex gap-3 shrink-0">
        <Dropdown
          items={CAUSE_STATUS_FILTERS}
          value={statusFilter}
          onChange={onStatusFilterChange}
          triggerLabel="All statuses"
          ariaLabel="Filter by status"
          fullWidth={false}
          className="w-full sm:w-44"
        />
        <Dropdown
          items={CAUSE_SORT_OPTIONS}
          value={sortOrder}
          onChange={onSortOrderChange}
          triggerLabel="Newest first"
          ariaLabel="Sort order"
          fullWidth={false}
          className="w-full sm:w-44"
        />
      </div>
    </div>
  );
}
