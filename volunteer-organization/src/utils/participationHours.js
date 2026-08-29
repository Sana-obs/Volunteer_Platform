/**
 * @param {{committedHours:number, hoursLogged:number|null}} participation
 * @returns {string}
 */
export function formatParticipationHours({ committedHours, hoursLogged }) {
  const isConfirmed = hoursLogged !== null && hoursLogged !== undefined;
  if (!isConfirmed) return `${committedHours} hrs pledged`;

  const remaining = committedHours - hoursLogged;
  const remainingLabel = remaining > 0 ? ` (${remaining} remaining)` : "";

  return `Pledged ${committedHours} hrs → Confirmed ${hoursLogged} hrs${remainingLabel}`;
}
