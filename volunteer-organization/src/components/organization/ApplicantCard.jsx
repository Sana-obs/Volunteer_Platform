
import { useState } from "react";
import { MapPin, Phone, Mail, Check, X, CheckCircle2, Clock3 } from "lucide-react";
import Button from "../ui/Button";
import Avatar from "../common/Avatar";
import SkillChipsPreview from "../common/SkillChipsPreview";
import ParticipationStatusBadge from "../opportunity/ParticipationStatusBadge";
import VolunteerProfilePreviewModal from "./VolunteerProfilePreviewModal";
import RejectionReasonModal from "../common/RejectionReasonModal";
import { PARTICIPATION_STATUS } from "../../constants/participationStatus";
import { CARD_BASE } from "../../utils/surfaceStyles";
import { formatDateTime } from "../../utils/formatDateTime";

export default function ApplicantCard({
  applicant,
  onAccept,
  onReject,
  onManageHours,
  isUpdating,
  isVerified = true,
  isManagingHours = false,
  opportunityHasEnded = false,
  isHighlighted = false,
}) {
  const { volunteer, status, participatedAt, committedHours, hoursLogged } = applicant;
  const isPending = status === PARTICIPATION_STATUS.PENDING;
  const isAccepted = status === PARTICIPATION_STATUS.ACCEPTED;
  const isExpired = status === PARTICIPATION_STATUS.EXPIRED;
  const isWithdrawn = status === PARTICIPATION_STATUS.WITHDRAWN;
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const canManageHours = isAccepted && opportunityHasEnded;
  const hasConfirmedHours = hoursLogged !== null && hoursLogged !== undefined;

  const handleConfirmReject = async (reason) => {
    await onReject(applicant.id, reason);
    setIsRejectModalOpen(false);
  };

  if (!volunteer) return null;

  return (
    <div
      id={`applicant-${applicant.id}`}
      className={`${CARD_BASE} flex flex-col gap-4 scroll-mt-24 transition-shadow duration-500 ${
        isHighlighted ? "ring-2 ring-primary ring-offset-2 ring-offset-bg" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Avatar src={volunteer.photo} name={volunteer.name} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-heading truncate">
                <button
                  type="button"
                  onClick={() => setIsProfilePreviewOpen(true)}
                  className="hover:text-primary hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {volunteer.name}
                </button>
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-body mt-1">
                {volunteer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-primary shrink-0" aria-hidden="true" />
                    {volunteer.city}
                  </span>
                )}
                {volunteer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-primary shrink-0" aria-hidden="true" />
                    {volunteer.phone}
                  </span>
                )}
                {volunteer.email && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Mail size={13} className="text-primary shrink-0" aria-hidden="true" />
                    <span className="truncate">{volunteer.email}</span>
                  </span>
                )}
                {participatedAt && (
                  <span className="text-heading/40">
                    Applied {formatDateTime(participatedAt, { dateStyle: "medium" })}
                  </span>
                )}
                {committedHours != null && (
                  <span className="flex items-center gap-1 text-heading/60">
                    <Clock3 size={13} className="text-primary shrink-0" aria-hidden="true" />
                    {hasConfirmedHours ? `${hoursLogged} hrs confirmed` : `${committedHours} hrs pledged`}
                  </span>
                )}
              </div>
            </div>

            <ParticipationStatusBadge participation={{ status }} className="shrink-0" />
          </div>

          {volunteer.skills?.length > 0 && (
            <div className="mt-3">
              <SkillChipsPreview skills={volunteer.skills} max={4} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 pt-3 border-t border-heading/10">
        {isPending && (
          <p className="text-xs text-heading/40">
            This decision is final and can't be reversed once submitted.
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          {isPending ? (
            <>
              <Button
                variant="success"
                size="small"
                disabled={isUpdating || !isVerified}
                onClick={() => onAccept(applicant.id)}
                className="flex items-center gap-1 !px-3 !py-1.5 !text-sm"
                title={!isVerified ? "Available once your organization is verified" : undefined}
              >
                <Check size={14} />
                Accept
              </Button>
              <Button
                variant="ghost"
                size="small"
                disabled={isUpdating || !isVerified}
                onClick={() => setIsRejectModalOpen(true)}
                className="flex items-center gap-1 !px-3 !py-1.5 !text-sm text-danger hover:bg-danger/10"
                title={!isVerified ? "Available once your organization is verified" : undefined}
              >
                <X size={14} />
                Reject
              </Button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-xs font-medium text-heading/50">
                <CheckCircle2 size={14} aria-hidden="true" />
                {isWithdrawn
                  ? "Volunteer withdrew"
                  : isExpired
                    ? "No response before it started"
                    : hasConfirmedHours
                      ? "Hours confirmed"
                      : "Decision completed"}
              </span>

              {canManageHours && (
                <Button
                  variant="secondary"
                  size="small"
                  disabled={isManagingHours || !isVerified}
                  onClick={() => onManageHours(applicant)}
                  className="flex items-center gap-1 !px-3 !py-1.5 !text-sm"
                  title={!isVerified ? "Available once your organization is verified" : undefined}
                >
                  <Clock3 size={14} />
                  {hasConfirmedHours ? "Edit hours" : "Manage hours"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <VolunteerProfilePreviewModal
        open={isProfilePreviewOpen}
        onClose={() => setIsProfilePreviewOpen(false)}
        volunteer={volunteer}
      />

      <RejectionReasonModal
        open={isRejectModalOpen}
        title={`Reject ${volunteer.name || "this applicant"}?`}
        description="This decision is final and can't be reversed. Add a short reason so the volunteer understands why their application wasn't accepted."
        placeholder="e.g. We've already reached full capacity for this role."
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        isSubmitting={isUpdating}
      />
    </div>
  );
}