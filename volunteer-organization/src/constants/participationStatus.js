import { Clock, CheckCircle2, XCircle, LogOut, AlarmClockOff } from "lucide-react";

// Participation states. Expired is computed when a pending request
// reaches the opportunity start date.
export const PARTICIPATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  EXPIRED: "expired",
};

export const PARTICIPATION_STATUS_META = {
  [PARTICIPATION_STATUS.PENDING]: {
    label: "Pending Review",
    color: "gold",
    icon: Clock,
  },
  [PARTICIPATION_STATUS.ACCEPTED]: {
    label: "Accepted",
    color: "green",
    icon: CheckCircle2,
  },
  [PARTICIPATION_STATUS.REJECTED]: {
    label: "Rejected",
    color: "red",
    icon: XCircle,
  },
  [PARTICIPATION_STATUS.WITHDRAWN]: {
    label: "Withdrew",
    color: "gray",
    icon: LogOut,
  },
  [PARTICIPATION_STATUS.EXPIRED]: {
    label: "Expired",
    color: "gray",
    icon: AlarmClockOff,
  },
};

// Pending requests expire when the opportunity has started.
export function getEffectiveParticipationStatus(
  participation,
  opportunity,
  now = new Date()
) {
  if (participation.status !== PARTICIPATION_STATUS.PENDING) {
    return participation.status;
  }

  const startDate = opportunity?.startDate
    ? new Date(opportunity.startDate)
    : null;

  if (startDate && now >= startDate) {
    return PARTICIPATION_STATUS.EXPIRED;
  }

  return PARTICIPATION_STATUS.PENDING;
}
