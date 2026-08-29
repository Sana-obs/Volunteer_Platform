
const SEEN_KEY = "participations:seenHoursLogged";

export function getSeenHoursMap() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    return new Map();
  }
}

export function markHoursSeen(participationId, hoursLogged) {
  const current = getSeenHoursMap();
  current.set(participationId, hoursLogged);

  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Object.fromEntries(current)));
  } catch {
    // تجاهل أي خطأ تخزين (وضع التصفح الخاص، أو تجاوز الحصة المسموحة)
  }
}