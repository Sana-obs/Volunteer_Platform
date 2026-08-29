
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users2, ChevronRight } from "lucide-react";
import Typography from "../ui/Typography";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";
import { ROUTES } from "../../constants/paths";

export default function OpportunitiesBreakdownChart({ opportunities = [] }) {
  return (
    <div className={`${PANEL_SURFACE} p-6 md:p-8`}>
    
      <div className="flex items-center gap-2 mb-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users2 size={20} aria-hidden="true" />
        </span>
        <Typography variant="h4">Volunteer Capacity by Cause</Typography>
      </div>
      <Typography variant="bodySm" className="mb-5 text-body">
        How full each of your published causes is right now.
      </Typography>

      <div className="flex flex-col divide-y divide-heading/10">
        {opportunities.map((opportunity) => {
          const percent = opportunity.maxVolunteers
            ? Math.min(100, Math.round((opportunity.currentVolunteers / opportunity.maxVolunteers) * 100))
            : 0;
          const isClickable = Boolean(opportunity.id);

          const rowContent = (
            <>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <Typography
                    variant="bodySm"
                    color="heading"
                    weight="medium"
                    truncate
                    className={`max-w-[70%] ${isClickable ? "transition-colors group-hover:text-primary" : ""}`}
                  >
                    {opportunity.title}
                  </Typography>
                  <Typography variant="caption" color="muted" className="whitespace-nowrap">
                    {opportunity.currentVolunteers}/{opportunity.maxVolunteers} volunteers
                  </Typography>
                </div>

                <div className="h-2 w-full rounded-full bg-heading/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>

              {isClickable && (
                <ChevronRight
                  size={18}
                  className="shrink-0 self-center text-heading/30 transition-colors duration-150 group-hover:text-primary"
                  aria-hidden="true"
                />
              )}
            </>
          );

          return isClickable ? (
            <Link
              key={opportunity.id}
              to={ROUTES.MY_CAUSES}
              state={{ highlightOpportunityId: opportunity.id }}
              className="group flex items-center gap-3 -mx-2 rounded-xl px-2 py-3.5 transition-all duration-200 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {rowContent}
            </Link>
          ) : (
            <div key={opportunity.id} className="flex items-center gap-3 -mx-2 px-2 py-3.5">
              {rowContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}