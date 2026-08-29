import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Filter, Award, ArrowRight } from "lucide-react";
import Typography from "../components/ui/Typography";
import AuthAlert from "../components/auth/AuthAlert";
import ParticipationCard from "../components/opportunity/ParticipationCard";
import TabsFilter from "../components/ui/TabsFilter";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/common/EmptyState";
import ShowMoreButton from "../components/common/ShowMoreButton";
import { useMyParticipationsQuery } from "../hooks/queries/useMyParticipationsQuery";
import { useShowMore } from "../hooks/useShowMore";
import { useParticipationCounts } from "../hooks/useParticipationCounts";
import { matchesParticipationStatusTab } from "../utils/participationDisplayStatus";
import {
  PARTICIPATION_TAB,
  PARTICIPATION_TAB_DEFS,
} from "../constants/participationTabs";
import { CARD_SURFACE } from "../utils/surfaceStyles";
import { ROUTES } from "../constants/paths";

// Empty messages by tab
const TAB_EMPTY_MESSAGES = {
  [PARTICIPATION_TAB.PENDING]: "No requests awaiting review right now.",
  [PARTICIPATION_TAB.ACCEPTED]: "No accepted opportunities in this view.",
  [PARTICIPATION_TAB.ACTIVE]: "No opportunities in progress right now.",
  [PARTICIPATION_TAB.COMPLETED]: "No completed opportunities yet.",
  [PARTICIPATION_TAB.REJECTED]: "No rejected requests here.",
  [PARTICIPATION_TAB.WITHDRAWN]: "No withdrawals here.",
};

export default function Participates() {
  const navigate = useNavigate();
  const participationsQuery = useMyParticipationsQuery();
  const [activeTab, setActiveTab] = useState(PARTICIPATION_TAB.ALL);

  const participations = useMemo(
    () => participationsQuery.data ?? [],
    [participationsQuery.data],
  );

  const counts = useParticipationCounts(participations);

  // Build tabs with counts
  const tabs = useMemo(
    () =>
      PARTICIPATION_TAB_DEFS.map((tab) => ({
        ...tab,
        count:
          tab.id === PARTICIPATION_TAB.PENDING
            ? (counts.pending || 0) + (counts.expired || 0)
            : counts[tab.id],
      })),
    [counts],
  );

  const filteredParticipations = useMemo(
    () =>
      participations.filter((participation) =>
        matchesParticipationStatusTab(participation, activeTab),
      ),
    [participations, activeTab],
  );

  const {
    visibleItems: visibleParticipations,
    hasMore,
    remainingCount,
    showMore,
  } = useShowMore(filteredParticipations);

  const loading = participationsQuery.isPending;

  const error = participationsQuery.isError
    ? participationsQuery.error?.message ||
      "Failed to load your volunteering history"
    : "";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-6">
        <Typography variant="sectionTitle" className="mb-2">
          My Volunteering
        </Typography>

        <Typography variant="body" className="text-body">
          Track the opportunities you've joined and your progress so far.
        </Typography>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col items-start gap-8 md:flex-row">
        {/* Sticky filters */}
        <div className="w-full md:w-56 md:shrink-0 md:sticky md:top-19.75 md:self-start">
          <TabsFilter
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            ariaLabel="My volunteering status filter"
          />
        </div>

        {/* Content */}
        <div className="flex w-full flex-1 flex-col gap-y-6 min-w-0 md:max-w-4xl">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`${CARD_SURFACE} p-5 flex flex-col gap-3`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>

                  <Skeleton className="h-4 w-1/3" />

                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <AuthAlert variant="error">{error}</AuthAlert>
          ) : participations.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="You haven't joined any opportunities yet"
              description="Browse open opportunities that match your skills and start making an impact today."
              actionLabel="Explore Opportunities"
              onAction={() => navigate(ROUTES.EXPLORE)}
            />
          ) : (
            <>
              {/* Journey shortcut */}
              <Link
                to={ROUTES.MY_JOURNEY}
                className="flex items-center gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-5 transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Award
                    size={18}
                    className="text-primary"
                    aria-hidden="true"
                  />
                </div>

                <p className="flex-1 text-sm leading-relaxed text-body">
                  See your{" "}
                  <strong className="font-bold text-primary">
                    confirmed hours
                  </strong>{" "}
                  and{" "}
                  <strong className="font-bold text-primary">
                    achievements
                  </strong>{" "}
                  on your My Journey page.
                </p>

                <ArrowRight
                  size={16}
                  className="shrink-0 text-primary"
                  aria-hidden="true"
                />
              </Link>

              {filteredParticipations.length === 0 ? (
                <EmptyState
                  icon={Filter}
                  title="No participations in this status"
                  description={
                    TAB_EMPTY_MESSAGES[activeTab] ||
                    "Try a different status tab."
                  }
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {visibleParticipations.map((participation) => (
                    <ParticipationCard
                      key={participation.id}
                      participation={participation}
                    />
                  ))}

                  {hasMore && (
                    <ShowMoreButton
                      remainingCount={remainingCount}
                      onClick={showMore}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}