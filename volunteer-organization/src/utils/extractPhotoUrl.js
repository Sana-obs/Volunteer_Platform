
export function extractPhotoUrl(raw) {
  if (!raw) return ''
  if (typeof raw === 'string') return raw
  // كائن Media خام (باگ الباك اند أعلاه) — محاولة دفاعية أخيرة
  return raw.original_url || raw.url || ''
}
