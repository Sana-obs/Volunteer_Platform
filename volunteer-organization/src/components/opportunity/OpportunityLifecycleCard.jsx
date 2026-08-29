
import { Circle } from "lucide-react";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";
import Typography from "../ui/Typography";
import Chip from "../ui/Chip";
import { WITHDRAWAL_POLICY_META } from "../../utils/participationPolicy";
import { getDisplayStatusMeta, PARTICIPATION_DISPLAY_STATUS } from "../../utils/participationDisplayStatus";

const LIFECYCLE_STEPS = [
  { label: "Applied", meta: null },
  { label: "Under Review", meta: getDisplayStatusMeta(PARTICIPATION_DISPLAY_STATUS.PENDING) },
  { label: "Accepted", meta: getDisplayStatusMeta(PARTICIPATION_DISPLAY_STATUS.ACCEPTED) },
  { label: "Active", meta: getDisplayStatusMeta(PARTICIPATION_DISPLAY_STATUS.ACTIVE) },
  { label: "Completed", meta: getDisplayStatusMeta(PARTICIPATION_DISPLAY_STATUS.COMPLETED) },
];

function StepChip({ label, meta }) {
  if (!meta) {
    return (
      <Chip color="gray" className="inline-flex items-center gap-1 !py-0.5 !text-xs border-dashed opacity-70">
        <Circle size={12} aria-hidden="true" />
        {label}
      </Chip>
    );
  }

  const Icon = meta.icon;

  return (
    <Chip color={meta.color} className="inline-flex items-center gap-1 !py-0.5 !text-xs">
      {Icon && <Icon size={12} aria-hidden="true" />}
      {label}
    </Chip>
  );
}

export default function OpportunityLifecycleCard() {
  return (
    <div className={`${PANEL_SURFACE} p-5 mb-8`}>
      <Typography variant="h5" className="mb-4">
        How this works
      </Typography>
      {/* Vertical stepper — flex stretch lets the connector line span to the next dot with no height math */}
      <ol className="mb-5">
        {LIFECYCLE_STEPS.map((step, index) => {
          const isLastStep = index === LIFECYCLE_STEPS.length - 1;

          return (
            <li key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-heading/5 text-xs font-semibold text-heading/60">
                  {index + 1}
                </span>
                {!isLastStep && <span className="w-px flex-1 bg-heading/10" aria-hidden="true" />}
              </div>
              {/* Center the chip against the number circle */}
              <div className={`flex min-h-8 items-center ${isLastStep ? "" : "pb-5"}`}>
                <StepChip label={step.label} meta={step.meta} />
              </div>
            </li>
          );
        })}
      </ol>

      <Typography variant="h6" className="mb-2 pt-4 border-t border-heading/10">
        Withdrawal Policy
      </Typography>
      {/* Vertical stack so long labels don't unbalance the row */}
      <ul className="flex flex-col gap-3">
        {WITHDRAWAL_POLICY_META.map((entry) => {
          const meta = getDisplayStatusMeta(entry.displayStatus);
          const Icon = meta?.icon;

          return (
            <li key={entry.displayStatus} className="flex flex-col gap-1 text-xs text-body pb-2">
              <Chip
                color={meta?.color || "gray"}
                className="inline-flex items-center gap-1 !py-0.5 !text-[11px] w-fit"
              >
                {Icon && <Icon size={11} aria-hidden="true" />}
                {entry.label}
              </Chip>
              <span className="leading-relaxed">{entry.description}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
