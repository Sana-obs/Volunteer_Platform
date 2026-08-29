import { PARTICIPATION_STATUS, PARTICIPATION_STATUS_META } from "../constants/participationStatus";
import { OPPORTUNITY_STATUS, OPPORTUNITY_STATUS_META } from "../constants/opportunityStatus";

export const PARTICIPATION_DISPLAY_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  ACTIVE: "active",
  COMPLETED: "completed",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  EXPIRED: "expired",
};

/**
 * @param {{status:string, opportunity:{status?:string}|null}} participation
 * @returns {string} إحدى قيم PARTICIPATION_DISPLAY_STATUS
 */
export function getParticipationDisplayStatus(participation) {
  const { status, opportunity } = participation;

  if (status !== PARTICIPATION_STATUS.ACCEPTED) return status;

  if (opportunity?.status === OPPORTUNITY_STATUS.IN_PROGRESS) return PARTICIPATION_DISPLAY_STATUS.ACTIVE;
  if (opportunity?.status === OPPORTUNITY_STATUS.COMPLETED) return PARTICIPATION_DISPLAY_STATUS.COMPLETED;

  return PARTICIPATION_DISPLAY_STATUS.ACCEPTED;
}

/**
 * @param {object} participation
 * @param {string} tabId - 'all' أو إحدى قيم PARTICIPATION_DISPLAY_STATUS
 */
export function matchesParticipationStatusTab(participation, tabId) {
  if (tabId === "all") return true;

  const displayStatus = getParticipationDisplayStatus(participation);

  if (tabId === PARTICIPATION_DISPLAY_STATUS.PENDING) {
    return displayStatus === PARTICIPATION_DISPLAY_STATUS.PENDING || displayStatus === PARTICIPATION_DISPLAY_STATUS.EXPIRED;
  }

  return displayStatus === tabId;
}

const DERIVED_STATUS_LABELS = {
  [PARTICIPATION_DISPLAY_STATUS.ACTIVE]: "Active",
  [PARTICIPATION_DISPLAY_STATUS.COMPLETED]: "Completed",
};

/**
 * @param {string} displayStatus - إحدى قيم PARTICIPATION_DISPLAY_STATUS
 * @returns {{label:string, color:string, icon:Function}|undefined}
 */
export function getDisplayStatusMeta(displayStatus) {
  if (displayStatus === PARTICIPATION_DISPLAY_STATUS.ACTIVE) {
    const { color, icon } = OPPORTUNITY_STATUS_META[OPPORTUNITY_STATUS.IN_PROGRESS];
    return { label: DERIVED_STATUS_LABELS[displayStatus], color, icon };
  }

  if (displayStatus === PARTICIPATION_DISPLAY_STATUS.COMPLETED) {
    const { color, icon } = OPPORTUNITY_STATUS_META[OPPORTUNITY_STATUS.COMPLETED];
    return { label: DERIVED_STATUS_LABELS[displayStatus], color, icon };
  }

  return PARTICIPATION_STATUS_META[displayStatus];
}

/**
 * @param {{status:string, opportunity?:{status?:string}|null}} participation
 * @returns {{label:string, color:string, icon:Function}}
 */
export function getParticipationStatusMeta(participation) {
  return getDisplayStatusMeta(getParticipationDisplayStatus(participation));
}
