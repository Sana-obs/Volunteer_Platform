import { useEffect, useMemo, useRef, useState } from "react";
import { useShowMore } from "../hooks/useShowMore";
import { useParams, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Users, Info } from "lucide-react";
import Typography from "../components/ui/Typography";
import Button from "../components/ui/Button";
import ApplicantCard from "../components/organization/ApplicantCard";
import ApplicantsSummaryStats from "../components/organization/ApplicantsSummaryStats";
import ApplicantsToolbar from "../components/organization/ApplicantsToolbar";
import ManageHoursModal from "../components/organization/ManageHoursModal";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/common/EmptyState";
import ShowMoreButton from "../components/common/ShowMoreButton";
import VerificationStatusBanner from "../components/OrgProfile/VerificationStatusBanner";
import Toast from "../components/common/Toast";
import { useOrganizationVerification } from "../hooks/useOrganizationVerification";
import { useOpportunityDetailsQuery } from "../hooks/queries/useOpportunityDetailsQuery";
import { useApplicantsQuery } from "../hooks/queries/useApplicantsQuery";
import { useUpdateParticipationStatusMutation } from "../hooks/queries/useUpdateParticipationStatusMutation";
import { useUpdateParticipationHoursMutation } from "../hooks/queries/useUpdateParticipationHoursMutation";
import { useToast } from "../hooks/useToast";
import { PARTICIPATION_STATUS } from "../constants/participationStatus";
import { CARD_SURFACE } from "../utils/surfaceStyles";
import { ROUTES } from "../constants/paths";

export default function ApplicantsList() {
  const { id } = useParams();
  const {
    status,
    rejectionReason,
    isVerified,
    hasLoadError,
  } = useOrganizationVerification();

  const opportunityQuery = useOpportunityDetailsQuery(id);
  const applicantsQuery = useApplicantsQuery(id);
  const updateStatusMutation = useUpdateParticipationStatusMutation(id);
  const updateHoursMutation = useUpdateParticipationHoursMutation(id);

  const opportunity = opportunityQuery.data?.opportunity ?? null;
  const applicants = useMemo(
    () => applicantsQuery.data ?? [],
    [applicantsQuery.data],
  );

  const loading =
    opportunityQuery.isPending || applicantsQuery.isPending;

  // Keep loading errors separate from the empty state.
  const error =
    opportunityQuery.isError || applicantsQuery.isError
      ? opportunityQuery.error?.message ||
        applicantsQuery.error?.message ||
        "Failed to load applicants"
      : "";

  const handleRetryLoad = () => {
    opportunityQuery.refetch();
    applicantsQuery.refetch();
  };

  const { toast, showSuccess, showError, closeToast } = useToast();

  // Hours can only be managed after the opportunity has ended.
  const opportunityHasEnded = Boolean(
    opportunity?.endDate &&
      new Date(opportunity.endDate) < new Date(),
  );

  // Null means the modal is closed; otherwise it contains the selected applicant.
  const [hoursModalApplicant, setHoursModalApplicant] = useState(null);

  // Uses mutation variables to identify the applicant currently being updated.
  const updatingId = updateStatusMutation.isPending
    ? updateStatusMutation.variables?.applicantId
    : null;

  const handleStatusChange = async (
    applicantId,
    newStatus,
    reason,
  ) => {
    if (!isVerified) return;

    const result = await updateStatusMutation.mutateAsync({
      applicantId,
      status: newStatus,
      reason,
    });

    if (!result.success) {
      showError(result.error || "Failed to update this request");
      return;
    }

    showSuccess(
      newStatus === PARTICIPATION_STATUS.ACCEPTED
        ? "Applicant accepted."
        : "Applicant rejected.",
    );
  };

  const handleConfirmHours = async (hours) => {
    if (!hoursModalApplicant || !isVerified) return;

    const result = await updateHoursMutation.mutateAsync({
      applicantId: hoursModalApplicant.id,
      hours,
    });

    if (!result.success) {
      showError(result.error || "Failed to update hours");
      return;
    }

    showSuccess("Hours confirmed.");
    setHoursModalApplicant(null);
  };

  // Client-side search, filtering, and sorting.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const visibleApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = applicants.filter((applicant) => {
      const matchesStatus =
        statusFilter === "all" ||
        applicant.status === statusFilter;

      const matchesSearch =
        !query ||
        applicant.volunteer?.name
          ?.toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });

    // participatedAt uses YYYY-MM-DD, so string comparison is sufficient.
    return [...filtered].sort((a, b) =>
      sortOrder === "newest"
        ? (b.participatedAt || "").localeCompare(
            a.participatedAt || "",
          )
        : (a.participatedAt || "").localeCompare(
            b.participatedAt || "",
          ),
    );
  }, [applicants, search, statusFilter, sortOrder]);

  const stats = useMemo(
    () => {
      // Calculated from actual hours logged by the organization.
      const totalHoursLogged = applicants
        .filter(
          (a) => a.status === PARTICIPATION_STATUS.ACCEPTED,
        )
        .reduce(
          (sum, a) => sum + Number(a.hoursLogged || 0),
          0,
        );

      return {
        total: applicants.length,
        pending: applicants.filter(
          (a) => a.status === PARTICIPATION_STATUS.PENDING,
        ).length,
        accepted: applicants.filter(
          (a) => a.status === PARTICIPATION_STATUS.ACCEPTED,
        ).length,
        rejected: applicants.filter(
          (a) => a.status === PARTICIPATION_STATUS.REJECTED,
        ).length,
        totalHoursLogged:
          Math.round(totalHoursLogged * 10) / 10,
      };
    },
    [applicants],
  );

  // Distinguishes an empty applicant list from empty filtered results.
  const hasAnyApplicants = applicants.length > 0;
  const hasFilteredResults = visibleApplicants.length > 0;

  // Pagination is applied to the filtered results.
  const {
    visibleItems: pagedApplicants,
    hasMore,
    remainingCount,
    showMore,
  } = useShowMore(visibleApplicants);

  // Handles navigation to a specific applicant from an external link.
  const { hash } = useLocation();
  const targetApplicantId = hash?.startsWith("#applicant-")
    ? hash.replace("#applicant-", "")
    : null;

  const [highlightedApplicantId, setHighlightedApplicantId] =
    useState(null);

  const hasScrolledToTargetRef = useRef(false);

  useEffect(() => {
    if (
      !targetApplicantId ||
      hasScrolledToTargetRef.current
    ) {
      return;
    }

    const targetIndex = visibleApplicants.findIndex(
      (applicant) => applicant.id === targetApplicantId,
    );

    if (targetIndex === -1) return;

    // Expand the list until the target applicant becomes visible.
    if (targetIndex >= pagedApplicants.length) {
      showMore();
      return;
    }

    hasScrolledToTargetRef.current = true;

    const element = document.getElementById(
      `applicant-${targetApplicantId}`,
    );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    const highlightTimeoutId = setTimeout(
      () => setHighlightedApplicantId(targetApplicantId),
      0,
    );

    const clearTimeoutId = setTimeout(
      () => setHighlightedApplicantId(null),
      2500,
    );

    return () => {
      clearTimeout(highlightTimeoutId);
      clearTimeout(clearTimeoutId);
    };
  }, [
    targetApplicantId,
    visibleApplicants,
    pagedApplicants.length,
    showMore,
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <VerificationStatusBanner
        status={status}
        rejectionReason={rejectionReason}
        hasLoadError={hasLoadError}
      />

      <Link
        to={ROUTES.MY_CAUSES}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4"
      >
        <ArrowLeft size={16} />
        Back to My Causes
      </Link>

      <Typography variant="sectionTitle" className="mb-1">
        Applicants
      </Typography>

      {!loading && (
        <Typography variant="body" className="mb-6 text-body">
          {opportunity?.title}
        </Typography>
      )}

      {/* Explains when and how the organization can record actual hours. */}
      {!loading && !error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
          <Info
            size={16}
            className="mt-0.5 shrink-0 text-primary"
            aria-hidden="true"
          />

          <p className="text-sm text-body">
            Once the opportunity&apos;s end date passes, you can
            log the actual number of hours each accepted volunteer
            completed.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={`${CARD_SURFACE} p-5 flex flex-col sm:flex-row sm:items-center gap-4`}
            >
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />

              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
          <p>{error}</p>

          <Button
            variant="danger"
            size="small"
            onClick={handleRetryLoad}
          >
            Retry
          </Button>
        </div>
      ) : !hasAnyApplicants ? (
        <EmptyState
          icon={Users}
          title="No applicants yet"
          description="Once volunteers apply to this cause, they'll show up here."
        />
      ) : (
        <>
          <ApplicantsSummaryStats {...stats} />

          <ApplicantsToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />

          {!hasFilteredResults ? (
            <EmptyState
              icon={Users}
              title="No matching applicants"
              description="Try a different search term or reset the status filter."
            />
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {pagedApplicants.map((applicant) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    isUpdating={updatingId === applicant.id}
                    isVerified={isVerified}
                    isManagingHours={
                      updateHoursMutation.isPending
                    }
                    opportunityHasEnded={opportunityHasEnded}
                    isHighlighted={
                      highlightedApplicantId === applicant.id
                    }
                    onAccept={(applicantId) =>
                      handleStatusChange(
                        applicantId,
                        PARTICIPATION_STATUS.ACCEPTED,
                      )
                    }
                    onReject={(applicantId, reason) =>
                      handleStatusChange(
                        applicantId,
                        PARTICIPATION_STATUS.REJECTED,
                        reason,
                      )
                    }
                    onManageHours={setHoursModalApplicant}
                  />
                ))}
              </div>

              {hasMore && (
                <ShowMoreButton
                  remainingCount={remainingCount}
                  onClick={showMore}
                />
              )}
            </>
          )}
        </>
      )}

      <ManageHoursModal
        open={Boolean(hoursModalApplicant)}
        onClose={() => setHoursModalApplicant(null)}
        onConfirm={handleConfirmHours}
        volunteerName={hoursModalApplicant?.volunteer?.name}
        committedHours={hoursModalApplicant?.committedHours}
        currentHoursLogged={hoursModalApplicant?.hoursLogged}
        isSubmitting={updateHoursMutation.isPending}
      />

      <Toast
        message={toast.message}
        variant={toast.variant}
        duration={7000}
        onClose={closeToast}
      />
    </div>
  );
}
