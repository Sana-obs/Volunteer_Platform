import Chip from "../ui/Chip";
import { getParticipationStatusMeta } from "../../utils/participationDisplayStatus";

export default function ParticipationStatusBadge({ participation, className = "" }) {
  const meta = getParticipationStatusMeta(participation);

  if (!meta) return null;

  const Icon = meta.icon;

  return (
    <Chip color={meta.color} className={`inline-flex items-center gap-1.5 ${className}`}>
      {Icon && <Icon size={13} aria-hidden="true" />}
      {meta.label}
    </Chip>
  );
}
