
const SEEN_KEY = "admin:seenPendingOrganizationIds";

export function getSeenPendingOrganizationIds() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markPendingOrganizationSeen(organizationId, updatedSet) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...updatedSet]));
  } catch {
    // تجاهل أي خطأ تخزين (وضع التصفح الخاص، أو تجاوز الحصة المسموحة)
  }
}
