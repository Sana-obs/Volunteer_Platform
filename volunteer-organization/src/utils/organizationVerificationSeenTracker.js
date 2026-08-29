
const SEEN_KEY = "organization:seenVerificationStatus";

export function getSeenOrganizationStatusMap() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Map(Object.entries(JSON.parse(raw))) : new Map();
  } catch {
    return new Map();
  }
}

export function markOrganizationStatusSeen(organizationId, status) {
  if (!organizationId) return;

  const current = getSeenOrganizationStatusMap();
  current.set(String(organizationId), status);

  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Object.fromEntries(current)));
  } catch {
    // تجاهل أي خطأ تخزين (وضع التصفح الخاص، أو تجاوز الحصة المسموحة)
  }
}
