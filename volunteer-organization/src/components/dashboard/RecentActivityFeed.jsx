
import { Link } from "react-router-dom";
import { Users, ChevronRight, Inbox } from "lucide-react";
import Typography from "../ui/Typography";
import EmptyState from "../common/EmptyState";
import ParticipationStatusBadge from "../opportunity/ParticipationStatusBadge";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";
import { ROUTES } from "../../constants/paths";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentActivityFeed({ activity = [] }) {
  return (
    <div className={`${PANEL_SURFACE} p-6 md:p-8`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users size={20} aria-hidden="true" />
        </span>
        <Typography variant="h4">Recent Activity</Typography>
      </div>
      <Typography variant="bodySm" className="mb-5 text-body">
        Requests awaiting your review, and recent decisions.
      </Typography>

      {activity.length === 0 ? (
        <EmptyState icon={Inbox} title="No recent activity yet" />
      ) : (
        <ul className="flex flex-col divide-y divide-heading/10">
          {activity.map((item) => {
            const isLinkable = Boolean(item.opportunityId);

            const rowContent = (
              <>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users size={16} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <Typography
                    variant="bodySm"
                    color="heading"
                    className={`font-semibold leading-snug truncate ${
                      isLinkable ? "transition-colors group-hover:text-primary" : ""
                    }`}
                  >
                    {item.volunteerName}
                  </Typography>
                  <Typography variant="caption" color="muted" className="block truncate">
                    Applied to {item.opportunityTitle} · {formatDate(item.date)}
                  </Typography>
                </div>

                <ParticipationStatusBadge participation={{ status: item.status }} className="shrink-0" />

                {isLinkable && (
                  <ChevronRight
                    size={18}
                    className="shrink-0 self-center text-heading/30 transition-colors duration-150 group-hover:text-primary"
                    aria-hidden="true"
                  />
                )}
              </>
            );

            return (
              <li key={item.id} className="py-1 first:pt-0 last:pb-0">
                {isLinkable ? (
                  <Link
                    to={`${ROUTES.APPLICANTS}/${item.opportunityId}#applicant-${item.id}`}
                    className="group flex items-start gap-3 -mx-2 rounded-xl px-2 py-2.5 transition-all duration-200 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {rowContent}
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-2 py-2.5">{rowContent}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}