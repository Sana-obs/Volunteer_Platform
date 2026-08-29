import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPin, Calendar, Clock, Phone, Users } from "lucide-react";
import Typography from "../../components/ui/Typography";
import Chip from "../../components/ui/Chip";
import Button from "../../components/ui/Button";
import OpportunityProgressBar from "../../components/opportunity/OpportunityProgressBar";
import OpportunityLifecycleCard from "../../components/opportunity/OpportunityLifecycleCard";
import OpportunityStatusBadge from "../../components/opportunity/OpportunityStatusBadge";
import StatusLegendPopover from "../../components/ui/StatusLegendPopover";
import ParticipateHoursModal from "../../components/opportunity/ParticipateHoursModal";
import Skeleton from "../../components/ui/Skeleton";
import Avatar from "../../components/common/Avatar";
import AuthAlert from "../../components/auth/AuthAlert";
import SimilarOpportunities from "../../components/opportunity/SimilarOpportunities";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";
import { useOpportunityDetailsQuery } from "../../hooks/queries/useOpportunityDetailsQuery";
import { useParticipateMutation } from "../../hooks/queries/useParticipateMutation";
import { useAuth } from "../../hooks/useAuth";
import { ACCOUNT_TYPES } from "../../constants/auth/accountTypes";
import { ROUTES } from "../../constants/paths";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORY_ILLUSTRATIONS,
  getCategoryLabel,
} from "../../utils/categoryStyles";
import { OPPORTUNITY_STATUS } from "../../constants/opportunityStatus";

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OpportunityDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, accountType } = useAuth();

  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Falls back to the category illustration when the cover image fails to load.
  const [coverImageFailed, setCoverImageFailed] = useState(false);

  // Opens before the participation request is submitted.
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  // Respects the user's reduced-motion preference.
  const prefersReducedMotion = useReducedMotion();

  const detailsQuery = useOpportunityDetailsQuery(id);
  const participateMutation = useParticipateMutation(id);

  const opportunity = detailsQuery.data?.opportunity ?? null;
  // Similar opportunities are returned with the details response.
  const similarOpportunities = detailsQuery.data?.similar ?? [];

  const loading = detailsQuery.isPending;
  const loadError = detailsQuery.isError
    ? detailsQuery.error?.message || "Failed to load this opportunity"
    : "";

  async function handleParticipate(committedHours) {
    setJoinError("");

    const result = await participateMutation.mutateAsync(committedHours);

    if (result?.success) {
      setIsHoursModalOpen(false);
      setHasJoined(true);
    } else {
      // Keep the modal open so the volunteer can retry with another value.
      setJoinError(result?.error || "Failed to join this opportunity");
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mirrors the main page structure to reduce layout shift while loading. */}
        <div className="max-w-3xl">
          <Skeleton className="h-9 w-2/3 mb-8" />
          <Skeleton className="w-full aspect-video max-h-96 rounded-3xl mb-8" />

          <div className="flex flex-wrap gap-4 mb-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>

          <Skeleton className="h-2 w-full rounded-full mb-8" />
          <Skeleton className="h-11 w-40 rounded-xl mb-8" />
          <Skeleton className="h-24 w-full rounded-2xl mb-8" />
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (loadError || !opportunity) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AuthAlert variant="error">
          {loadError || "This opportunity could not be found."}
        </AuthAlert>
      </div>
    );
  }

  const isVolunteer =
    isAuthenticated && accountType === ACCOUNT_TYPES.VOLUNTEER;

  // Keeps all participation button states in one place.
  const isGuest = !isAuthenticated;
  const isNonVolunteerAccount = isAuthenticated && !isVolunteer;
  const spotsLeft = Math.max(
    opportunity.maxVolunteers - opportunity.currentVolunteers,
    0,
  );

  const categoryName = opportunity.category?.name;
  const categoryStyle =
    CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.Social;
  const CategoryIcon = CATEGORY_ICONS[categoryName] || MapPin;
  const CategoryIllustration = CATEGORY_ILLUSTRATIONS[categoryName];

  // Registration is open only when the opportunity status allows participation.
  const isRegistrationOpen =
    opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_OPEN;

  // Provides a user-facing explanation for the closed registration state.
  const registrationClosedMessage =
    opportunity.registrationClosedReason === "city_deactivated"
      ? "Registration is closed because this governorate is no longer served by the platform. Volunteers already joined can continue normally until this opportunity ends."
      : opportunity.status === OPPORTUNITY_STATUS.IN_PROGRESS ||
          opportunity.status === OPPORTUNITY_STATUS.COMPLETED
        ? "This opportunity is no longer accepting new volunteers."
        : spotsLeft === 0
          ? "This opportunity is fully booked."
          : "Registration for this opportunity has closed.";

  const participateLabel = isGuest
    ? "Participate"
    : hasJoined
      ? "You're in! ✓"
      : !isRegistrationOpen
        ? spotsLeft === 0
          ? "Fully Booked"
          : "Registration Closed"
        : "Participate";

  // Shared behavior for the main and mobile participation buttons.
  const handleParticipateClick = isGuest
    ? () => navigate(ROUTES.REGISTER)
    : isVolunteer
      ? () => {
          setJoinError("");
          setIsHoursModalOpen(true);
        }
      : undefined;

  const isParticipateDisabled =
    isNonVolunteerAccount ||
    hasJoined ||
    (!isGuest && !isRegistrationOpen);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 lg:pb-10">
      <nav
        className="text-sm text-heading/50 mb-4"
        aria-label="Breadcrumb"
      >
        <Link
          to={ROUTES.OPPORTUNITIES}
          className="hover:text-primary rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Opportunities
        </Link>

        <span className="mx-2">/</span>

        <span className="text-heading">{opportunity.title}</span>
      </nav>

      {/* Main details column with lifecycle and similar opportunities in the sidebar. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 lg:gap-10 items-start">
        <div className="min-w-0">
          {/* Opportunity title, status, and status legend. */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <Typography variant="h1">
              {opportunity.title}
            </Typography>

            <div className="flex items-center gap-2">
              <OpportunityStatusBadge status={opportunity.status} />
              <StatusLegendPopover />
            </div>
          </div>

          {/* Cover image with category fallback. */}
          <div className="w-full aspect-video max-h-96 rounded-3xl overflow-hidden border border-heading/10 bg-heading/5 shadow-sm flex items-center justify-center mb-8">
            {opportunity.image && !coverImageFailed ? (
              <img
                src={opportunity.image}
                alt={opportunity.title}
                onError={() => setCoverImageFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : CategoryIllustration ? (
              <div className="flex w-full h-full items-center justify-center bg-canvas overflow-hidden">
                <CategoryIllustration className="w-full h-full object-contain p-6" />
              </div>
            ) : (
              <div
                className={`flex w-full h-full items-center justify-center ${categoryStyle}`}
              >
                <CategoryIcon size={48} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-body">
            <span className="flex items-center gap-1">
              <MapPin
                size={16}
                className="text-primary"
                aria-hidden="true"
              />
              {opportunity.location}
            </span>

            <span className="flex items-center gap-1">
              <Calendar
                size={16}
                className="text-primary"
                aria-hidden="true"
              />
              {formatDate(opportunity.startDate)} -{" "}
              {formatDate(opportunity.endDate)}
            </span>

            <span className="flex items-center gap-1">
              <Clock
                size={16}
                className="text-primary"
                aria-hidden="true"
              />
              {opportunity.minHours}-{opportunity.maxHours} hrs / session
            </span>

            {opportunity.isGroup === true && (
              <span className="flex items-center gap-1">
                <Users
                  size={16}
                  className="text-primary"
                  aria-hidden="true"
                />
                Group opportunity
              </span>
            )}
          </div>

          {/* Opportunity category. */}
          {categoryName ? (
            <div className="mb-6">
              <Chip
                customStyle={categoryStyle}
                className="inline-flex items-center gap-1.5 w-fit"
              >
                <CategoryIcon size={13} aria-hidden="true" />
                {getCategoryLabel(categoryName)}
              </Chip>
            </div>
          ) : null}

          <div className="mb-8">
            <OpportunityProgressBar
              current={opportunity.currentVolunteers}
              max={opportunity.maxVolunteers}
            />
          </div>

          {/* Registration deadline is shown only during registration stages. */}
          {(opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_OPEN ||
            opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_CLOSED) &&
          opportunity.registerEndAt ? (
            <p className="mb-8 -mt-4 text-xs text-heading/50">
              Registration{" "}
              {opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_CLOSED
                ? "closed"
                : "closes"}{" "}
              on {formatDate(opportunity.registerEndAt)}
            </p>
          ) : null}

          {/* Main participation action. */}
          <div className="mb-8">
            <Button
              variant="primary"
              size="large"
              onClick={handleParticipateClick}
              isLoading={false}
              disabled={isParticipateDisabled}
              loadingText="Joining..."
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={participateLabel}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, scale: 0.9 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: 0, scale: 0.9 }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.18,
                  }}
                  className="inline-block"
                >
                  {participateLabel}
                </motion.span>
              </AnimatePresence>
            </Button>

            {/* Explains why participation is unavailable or requires authentication. */}
            {isNonVolunteerAccount ? (
              <p className="mt-2 text-sm text-heading/50">
                Only volunteer accounts can join opportunities.
              </p>
            ) : !isGuest && !hasJoined && !isRegistrationOpen ? (
              <p className="mt-2 text-sm text-heading/50">
                {registrationClosedMessage}
              </p>
            ) : isGuest ? (
              <p className="mt-2 text-sm text-heading/50">
                You'll need to create an account or sign in to join this
                opportunity.
              </p>
            ) : null}

            {joinError ? (
              <div className="mt-2">
                <AuthAlert variant="error">{joinError}</AuthAlert>
              </div>
            ) : null}
          </div>

          {opportunity.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-8">
              {opportunity.skills.map((skill) => (
                <Chip key={skill.id} color="blue">
                  {skill.name}
                </Chip>
              ))}
            </div>
          ) : null}

          <div className={`${PANEL_SURFACE} p-6 mb-8`}>
            <p className="text-sm text-heading/50 mb-2">Organized by</p>

            <div className="flex items-start gap-3">
              <Avatar
                src={opportunity.organization?.imageUrl}
                name={opportunity.organization?.name}
                size="sm"
              />

              <div className="min-w-0">
                {opportunity.organization?.id ? (
                  <Link
                    to={`${ROUTES.ORGANIZATIONS}/${opportunity.organization.id}`}
                    className="text-lg font-semibold text-heading transition-colors hover:text-primary rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {opportunity.organization.name}
                  </Link>
                ) : (
                  <p className="text-lg font-semibold text-heading">
                    {opportunity.organization?.name}
                  </p>
                )}

                {opportunity.organization?.phone ? (
                  <a
                    href={`tel:${opportunity.organization.phone}`}
                    className="mt-1 flex items-center gap-2 text-sm text-body transition-colors hover:text-primary w-fit rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Phone
                      size={14}
                      className="text-primary shrink-0"
                      aria-hidden="true"
                    />
                    {opportunity.organization.phone}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <Typography variant="h4" className="mb-3">
            About this opportunity
          </Typography>

          <Typography
            variant="body"
            className="text-body leading-relaxed"
          >
            {opportunity.description}
          </Typography>
        </div>

        {/* Sidebar with lifecycle information and similar opportunities. */}
        <div>
          <OpportunityLifecycleCard />
          <SimilarOpportunities opportunities={similarOpportunities} />
        </div>
      </div>

      {/* Mobile-only sticky participation action. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-heading/10 bg-field/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Typography
            variant="bodySm"
            className="min-w-0 flex-1 truncate font-semibold text-heading"
          >
            {opportunity.title}
          </Typography>

          <Button
            variant="primary"
            onClick={handleParticipateClick}
            disabled={isParticipateDisabled}
            loadingText="Joining..."
            className="shrink-0"
          >
            {participateLabel}
          </Button>
        </div>
      </div>

      <ParticipateHoursModal
        open={isHoursModalOpen}
        onClose={() => setIsHoursModalOpen(false)}
        onConfirm={handleParticipate}
        minHours={opportunity.minHours}
        maxHours={opportunity.maxHours}
        submitting={participateMutation.isPending}
        serverError={joinError}
      />
    </div>
  );
}
