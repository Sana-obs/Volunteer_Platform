import Chip from "../ui/Chip";
import { OPPORTUNITY_STATUS_META } from "../../constants/opportunityStatus";

export default function OpportunityStatusBadge({ status, className = "" }) {
  const meta = OPPORTUNITY_STATUS_META[status];

  if (!meta) return null;

  const Icon = meta.icon;

  return (
    <Chip color={meta.color} className={`inline-flex items-center gap-1.5 ${className}`}>
      {Icon && <Icon size={13} aria-hidden="true" />}
      {meta.label}
    </Chip>
  );
}