import { Target, LayoutGrid } from "lucide-react";

export const OPPORTUNITY_TABS = {
  ALL: "all",
  SUGGESTED: "suggested",
};

export const OPPORTUNITY_TAB_DEFS = [
  {
    id: OPPORTUNITY_TABS.ALL,
    label: "All Opportunities",
    icon: LayoutGrid,
  },
  {
    id: OPPORTUNITY_TABS.SUGGESTED,
    label: "Recommended for You",
    icon: Target,
  },
];
