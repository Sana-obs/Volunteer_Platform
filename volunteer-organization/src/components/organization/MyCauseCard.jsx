import { useState } from "react";
import { MapPin, Calendar, Users, Pencil, Trash2, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../ui/Card";
import Chip from "../ui/Chip";
import Button from "../ui/Button";
import ConfirmModal from "../common/ConfirmModal";
import OpportunityStatusBadge from "../opportunity/OpportunityStatusBadge";
import { OPPORTUNITY_STATUS } from "../../constants/opportunityStatus";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_ILLUSTRATIONS, getCategoryLabel } from "../../utils/categoryStyles";
import { ROUTES } from "../../constants/paths";

function formatVolunteerProgress(current, max) {
  const safeCurrent = Math.max(0, current || 0);
  const safeMax = Math.max(1, max || 1);
  const percentage = Math.min(100, Math.round((safeCurrent / safeMax) * 100));
  return { safeCurrent, safeMax, percentage };
}

export default function MyCauseCard({
  opportunity,
  onDelete,
  onToggleStatus,
  isVerified = true,
  isHighlighted = false,
  ref,
}) {
  const navigate = useNavigate();
  const categoryName = opportunity.category?.name;
  const categoryStyle = CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.Social;
  const CategoryIcon = CATEGORY_ICONS[categoryName] || Users;
  const { safeCurrent, safeMax, percentage } = formatVolunteerProgress(
    opportunity.currentVolunteers,
    opportunity.maxVolunteers,
  );

  const isRegistrationClosed = opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_CLOSED;
  const canToggleRegistration =
    opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_OPEN ||
    opportunity.status === OPPORTUNITY_STATUS.REGISTRATION_CLOSED;

  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const busy = deleting || togglingStatus;

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    await onDelete?.(opportunity.id);
    setDeleting(false);
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmToggleStatus = async () => {
    const nextStatus = isRegistrationClosed
      ? OPPORTUNITY_STATUS.REGISTRATION_OPEN
      : OPPORTUNITY_STATUS.REGISTRATION_CLOSED;

    setTogglingStatus(true);
    await onToggleStatus?.(opportunity.id, nextStatus);
    setTogglingStatus(false);
    setIsToggleConfirmOpen(false);
  };

  const CategoryIllustration = CATEGORY_ILLUSTRATIONS[categoryName];

  const imageFallback = CategoryIllustration ? (
    <div className="flex w-full aspect-video items-center justify-center bg-canvas overflow-hidden">
      <CategoryIllustration className="w-full h-full object-contain p-2" />
    </div>
  ) : (
    <div className={`flex w-full aspect-video items-center justify-center ${categoryStyle}`}>
      <CategoryIcon className="h-10 w-10" aria-hidden="true" />
    </div>
  );

  return (
    <Card
      ref={ref}
      imageSrc={opportunity.image}
      imageAlt={opportunity.title}
      imageFallback={imageFallback}
      title={opportunity.title}
      titleAdornment={<OpportunityStatusBadge status={opportunity.status} />}
      className={isHighlighted ? "ring-2 ring-primary" : ""}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-body">
        <span className="flex items-center gap-1">
          <MapPin size={16} className="text-primary" aria-hidden="true" />
          {opportunity.location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={16} className="text-primary" aria-hidden="true" />
          {opportunity.startDate}
        </span>
      </div>

      {opportunity.category || opportunity.isGroup === true ? (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {opportunity.category ? (
            <Chip customStyle={categoryStyle} className="inline-block w-fit">
              {getCategoryLabel(opportunity.category.name)}
            </Chip>
          ) : null}

          {opportunity.isGroup === true ? (
            <Chip color="blue" className="inline-flex items-center gap-1 w-fit">
              <Users size={12} aria-hidden="true" />
              Group opportunity
            </Chip>
          ) : null}
        </div>
      ) : null}

      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="flex items-center gap-1 text-heading font-medium">
            <Users size={16} className="text-primary" aria-hidden="true" />
            {safeCurrent} of {safeMax} volunteers
          </span>
          <span className="text-heading/50">{percentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-heading/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {canToggleRegistration && opportunity.registerEndAt ? (
        <p className="mb-5 text-xs text-heading/50">
          Registration {isRegistrationClosed ? "closed" : "closes"} on {opportunity.registerEndAt}
        </p>
      ) : (
        <div className="mb-5" />
      )}

      <div className="mt-auto flex items-center gap-2">
        <Button
          variant="secondary"
          fullWidth
          disabled={busy}
          onClick={() => navigate(`${ROUTES.APPLICANTS}/${opportunity.id}`)}
        >
          View Applicants
        </Button>
        <Button
          variant="ghost"
          size="medium"
          disabled={busy || !isVerified}
          onClick={() => navigate(`${ROUTES.MY_CAUSES}/${opportunity.id}/edit`)}
          aria-label="Edit this cause"
          title={!isVerified ? "Available once your organization is verified" : undefined}
        >
          <Pencil size={18} />
        </Button>
        
        {canToggleRegistration && (
          <Button
            variant="ghost"
            size="medium"
            disabled={busy || !isVerified}
            isLoading={togglingStatus}
            loadingText="Updating..."
            onClick={() => setIsToggleConfirmOpen(true)}
            aria-label={isRegistrationClosed ? "Reopen registration" : "Close registration early"}
            title={
              !isVerified
                ? "Available once your organization is verified"
                : isRegistrationClosed
                  ? "Reopen registration for new volunteers"
                  : "Close registration to new volunteers early"
            }
          >
            {isRegistrationClosed ? <Unlock size={18} /> : <Lock size={18} />}
          </Button>
        )}
        <Button
          variant="ghost"
          size="medium"
          disabled={busy || !isVerified}
          isLoading={deleting}
          loadingText="Deleting..."
          onClick={() => setIsDeleteConfirmOpen(true)}
          className="text-danger hover:bg-danger/10 border-danger/20"
          aria-label="Delete this cause"
          title={!isVerified ? "Available once your organization is verified" : undefined}
        >
          <Trash2 size={18} />
        </Button>
      </div>

      <ConfirmModal
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${opportunity.title}"?`}
        description="This can't be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleting}
        loadingText="Deleting..."
      />

      <ConfirmModal
        open={isToggleConfirmOpen}
        onClose={() => setIsToggleConfirmOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={
          isRegistrationClosed
            ? `Reopen registration for "${opportunity.title}"?`
            : `Close registration for "${opportunity.title}" early?`
        }
        confirmLabel={isRegistrationClosed ? "Reopen" : "Close"}
        confirmVariant="primary"
        isLoading={togglingStatus}
        loadingText="Updating..."
      />
    </Card>
  );
}