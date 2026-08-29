import {
  LayoutGrid,
  Clock,
  CheckCircle2,
  PlayCircle,
  Award,
  XCircle,
  LogOut,
} from "lucide-react";

import { PARTICIPATION_DISPLAY_STATUS } from "../utils/participationDisplayStatus";

export const PARTICIPATION_TAB = {
  ALL: "all",
  ...PARTICIPATION_DISPLAY_STATUS,
};

export const PARTICIPATION_TAB_DEFS = [
  {
    id: PARTICIPATION_TAB.ALL,
    label: "All",
    icon: LayoutGrid,
    colorVariant: "neutral",
  },
  {
    id: PARTICIPATION_DISPLAY_STATUS.PENDING,
    label: "Pending",
    icon: Clock,
    colorVariant: "warning",
  },
  {
    id: PARTICIPATION_DISPLAY_STATUS.ACCEPTED,
    label: "Accepted",
    icon: CheckCircle2,
    colorVariant: "success",
  },
  {
    id: PARTICIPATION_DISPLAY_STATUS.ACTIVE,
    label: "Active",
    icon: PlayCircle,
    colorVariant: "neutral",
  },
  {
    id: PARTICIPATION_DISPLAY_STATUS.COMPLETED,
    label: "Completed",
    icon: Award,
    colorVariant: "neutral",
  },
  {
    id: PARTICIPATION_DISPLAY_STATUS.REJECTED,
    label: "Rejected",
    icon: XCircle,
    colorVariant: "danger",
  },
  {
    id: PARTICIPATION_DISPLAY_STATUS.WITHDRAWN,
    label: "Withdrawn",
    icon: LogOut,
    colorVariant: "neutral",
  },
];
