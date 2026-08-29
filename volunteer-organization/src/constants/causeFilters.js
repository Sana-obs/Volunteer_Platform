import { OPPORTUNITY_STATUS } from "./opportunityStatus";

export const CAUSE_STATUS_FILTERS = [
  { name: "All", value: "all" },
  { name: "Open", value: OPPORTUNITY_STATUS.REGISTRATION_OPEN },
  { name: "Closed", value: OPPORTUNITY_STATUS.REGISTRATION_CLOSED },
  { name: "In Progress", value: OPPORTUNITY_STATUS.IN_PROGRESS },
  { name: "Completed", value: OPPORTUNITY_STATUS.COMPLETED },
];

// Explicit sort options; the default page order is handled separately in MyCauses.
export const CAUSE_SORT_OPTIONS = [
  { name: "Newest first", value: "newest" },
  { name: "Closest start date", value: "closest_start" },
];
