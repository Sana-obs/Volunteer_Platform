import { Unlock, Lock, PlayCircle, CheckCircle2 } from "lucide-react";

// Effective opportunity statuses. Most are derived from dates and registration state.
export const OPPORTUNITY_STATUS = {
  REGISTRATION_OPEN: "registration_open",
  REGISTRATION_CLOSED: "registration_closed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

export const OPPORTUNITY_STATUS_META = {
  [OPPORTUNITY_STATUS.REGISTRATION_OPEN]: {
    label: "Open",
    color: "green",
    icon: Unlock,
    description: "There's still room to join.",
  },

  [OPPORTUNITY_STATUS.REGISTRATION_CLOSED]: {
    label: "Closed",
    color: "gold",
    icon: Lock,
    description: "Registration has ended, but the opportunity hasn't started yet.",
  },

  [OPPORTUNITY_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    color: "blue",
    icon: PlayCircle,
    description: "It's happening right now.",
  },

  [OPPORTUNITY_STATUS.COMPLETED]: {
    label: "Completed",
    color: "gray",
    icon: CheckCircle2,
    description: "It has finished.",
  },
};
