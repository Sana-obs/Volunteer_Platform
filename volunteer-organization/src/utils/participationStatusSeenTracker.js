
const SEEN_KEY = "participations:seenStatus";

export function getSeenStatusMap() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    return new Map();
  }
}

export function markStatusSeen(participationId, status) {
  const current = getSeenStatusMap();
  current.set(participationId, status);

  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Object.fromEntries(current)));
  } catch {
    // تجاهل أي خطأ تخزين (وضع التصفح الخاص، أو تجاوز الحصة المسموحة)
  }
}