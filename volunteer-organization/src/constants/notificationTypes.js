
import { Trophy, Clock3, CalendarClock, CheckCircle2, XCircle, LogOut, UserPlus, Building2, Bell } from "lucide-react";

export const NOTIFICATION_TYPE_ICONS = {
  achievement: Trophy,
  hours: Clock3,
  "status-accepted": CheckCircle2,
  "status-rejected": XCircle,
  "org-verified": CheckCircle2,
  "org-rejected": XCircle,
  "applicant-new": UserPlus,
  "applicant-withdrawn": LogOut,
  "opportunity-reminder": CalendarClock,
  "org-pending": Building2,
};

export const NOTIFICATION_TYPE_ICON_COLORS = {
  achievement: "text-amber-500",
  hours: "text-primary",
  "status-accepted": "text-emerald-500",
  "status-rejected": "text-red-500",
  "org-verified": "text-emerald-500",
  "org-rejected": "text-red-500",
  "applicant-new": "text-primary",
  "applicant-withdrawn": "text-heading/50",
  "opportunity-reminder": "text-sky-500",
  "org-pending": "text-amber-500",
};

export const NOTIFICATION_TYPE_LABELS = {
  achievement: "Achievements",
  hours: "Hours",
  "status-accepted": "Accepted",
  "status-rejected": "Declined",
  "org-verified": "Verification",
  "org-rejected": "Verification",
  "applicant-new": "New Applications",
  "applicant-withdrawn": "Withdrawals",
  "opportunity-reminder": "Reminders",
  "org-pending": "Verification",
};

export const DEFAULT_NOTIFICATION_ICON = Bell;