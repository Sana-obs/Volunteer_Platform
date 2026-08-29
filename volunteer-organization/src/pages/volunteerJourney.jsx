// pages/volunteerJourney.jsx

import { useMemo } from "react";
import Typography from "../components/ui/Typography";
import AuthAlert from "../components/auth/AuthAlert";
import Skeleton from "../components/ui/Skeleton";
import VolunteeringHoursSummary from "../components/volunteerProfile/VolunteeringHoursSummary";
import AchievementsList from "../components/volunteerProfile/AchievementsList";
import CompletedOpportunitiesTimeline from "../components/volunteerProfile/CompletedOpportunitiesTimeline";
import { useMyParticipationsQuery } from "../hooks/queries/useMyParticipationsQuery";
import { isCompletedParticipation } from "../utils/volunteerHoursSummary";
import { PANEL_SURFACE, CARD_SURFACE } from "../utils/surfaceStyles";

export default function VolunteerJourneyPage() {
  // Shared participation cache
  const participationsQuery = useMyParticipationsQuery();

  // Completed participations
  const completedParticipations = useMemo(
    () => (participationsQuery.data ?? []).filter(isCompletedParticipation),
    [participationsQuery.data],
  );

  // Show fetch errors
  const completedError = participationsQuery.isError
    ? participationsQuery.error?.message || "Failed to load your completed opportunities"
    : "";

  return (
    <div className="mx-auto w-full flex-1 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="container mx-auto px-4 md:px-16 py-10 md:py-14">
        <Typography variant="sectionTitle" className="mb-2">
          My Journey
        </Typography>

        <Typography variant="body" className="mb-8 text-body">
          Your volunteering story so far: hours confirmed, organizations you've
          supported, and achievements you've earned along the way.
        </Typography>

        <section className={`${PANEL_SURFACE} p-6 md:p-8`}>
          <Typography variant="h4" gutterBottom>
            Volunteering Overview
          </Typography>

          <VolunteeringHoursSummary />
        </section>

        {/* Achievements overview */}
        <section className={`mt-8 ${PANEL_SURFACE} p-6 md:p-8`}>
          <Typography variant="h4" gutterBottom>
            Achievements
          </Typography>

          <AchievementsList />
        </section>

        <section className={`mt-8 ${PANEL_SURFACE} p-6 md:p-8`}>
          <Typography variant="h4" gutterBottom>
            Completed Opportunities
          </Typography>

          {completedError ? (
            <AuthAlert variant="error">{completedError}</AuthAlert>
          ) : participationsQuery.isPending ? (
            // Timeline loading state
            <div className="flex flex-col gap-3 pl-6 sm:pl-7">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="mt-3 h-3 w-3 shrink-0 rounded-full" />

                  <div
                    className={`${CARD_SURFACE} flex flex-1 flex-col gap-2 px-3.5 py-3 sm:px-4`}
                  >
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CompletedOpportunitiesTimeline
              participations={completedParticipations}
            />
          )}
        </section>
      </div>
    </div>
  );
}