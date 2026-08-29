import { useMemo } from "react";
import { getParticipationDisplayStatus, PARTICIPATION_DISPLAY_STATUS } from "../utils/participationDisplayStatus";

const EMPTY_COUNTS = Object.fromEntries(
  Object.values(PARTICIPATION_DISPLAY_STATUS).map((status) => [status, 0]),
);

/**
 * @param {Array} participations
 * @returns {{all:number, pending:number, accepted:number, active:number, completed:number, rejected:number, withdrawn:number, expired:number}}
 */
export function useParticipationCounts(participations = []) {
  return useMemo(() => {
    const counts = { all: participations.length, ...EMPTY_COUNTS };

    participations.forEach((participation) => {
      const displayStatus = getParticipationDisplayStatus(participation);
      counts[displayStatus] = (counts[displayStatus] || 0) + 1;
    });

    return counts;
  }, [participations]);
}
