const SEEN_KEY = "achievements:celebratedIds";

export function getSeenAchievementIds() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markAchievementIdsSeen(ids) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
  } catch {
    // تجاهل أي خطأ تخزين (وضع التصفح الخاص، أو تجاوز الحصة المسموحة)
  }
}