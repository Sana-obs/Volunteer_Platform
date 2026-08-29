
import { PARTICIPATION_STATUS } from "../constants/participationStatus";
import { PARTICIPATION_DISPLAY_STATUS } from "./participationDisplayStatus";
import { isRegistrationOpen } from "./opportunityStatus";

/**
 * @param {{status:string, opportunity:object|null, canWithdraw?:boolean}} participation
 * @returns {boolean}
 */
export function canWithdraw(participation) {
  if (typeof participation?.canWithdraw === "boolean") return participation.canWithdraw;

  const { status, opportunity } = participation;
  const isEligibleStatus = status === PARTICIPATION_STATUS.PENDING || status === PARTICIPATION_STATUS.ACCEPTED;

  return isEligibleStatus && isRegistrationOpen(opportunity);
}

export const WITHDRAWAL_POLICY_META = [
  {
    displayStatus: PARTICIPATION_DISPLAY_STATUS.PENDING,
    label: "Pending",
    allowed: true,
    description: "Allowed — you can withdraw while registration for this opportunity is still open.",
  },
  {
    displayStatus: PARTICIPATION_DISPLAY_STATUS.ACCEPTED,
    label: "Accepted (while registration is open)",
    allowed: true,
    description:
      "Allowed — but only while registration is still open. Once registration closes (the opportunity is full, the registration window has passed, or the organization closed it manually), withdrawal is no longer possible, even if the opportunity hasn't started yet.",
  },
  {
    displayStatus: PARTICIPATION_DISPLAY_STATUS.ACTIVE,
    label: "Active",
    allowed: false,
    description: "Not allowed — the opportunity has already started.",
  },
  {
    displayStatus: PARTICIPATION_DISPLAY_STATUS.COMPLETED,
    label: "Completed",
    allowed: false,
    description: "Not allowed — the opportunity has finished.",
  },
  {
    displayStatus: PARTICIPATION_DISPLAY_STATUS.REJECTED,
    label: "Rejected",
    allowed: false,
    description: "Not allowed — there's nothing to withdraw from.",
  },
];
