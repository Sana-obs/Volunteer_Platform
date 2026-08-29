import { MOCK_PASSWORD_RESETS_STORAGE_KEY } from '../../constants/auth/storage'

// مدة صلاحية رابط إعادة التعيين بوضع Mock — ساعة واحدة، نفس المتعارف
// عليه بمعظم أنظمة Laravel الحقيقية (password_reset_tokens expire)
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

function loadResets() {
  try {
    const raw = localStorage.getItem(MOCK_PASSWORD_RESETS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveResets(resets) {
  localStorage.setItem(MOCK_PASSWORD_RESETS_STORAGE_KEY, JSON.stringify(resets))
}

// يولّد token جديد لإيميل معيّن، ويستبدل أي token سابق غير منتهٍ لنفس
// الإيميل (نفس سلوك Laravel: كل طلب جديد يُبطل الطلبات السابقة)
export function generateResetToken(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const resets = loadResets().filter((entry) => entry.email !== normalizedEmail)

  const token = crypto.randomUUID()
  resets.push({ email: normalizedEmail, token, expiresAt: Date.now() + RESET_TOKEN_TTL_MS })
  saveResets(resets)

  return token
}

// يتحقق من صلاحية token لإيميل معيّن، ويستهلكه فورًا عند النجاح (استخدام
// لمرة واحدة فقط) — يمنع إعادة استخدام نفس الرابط مرتين
export function consumeResetToken({ email, token }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const resets = loadResets()
  const index = resets.findIndex((entry) => entry.email === normalizedEmail && entry.token === token)

  if (index === -1) return false

  const isExpired = resets[index].expiresAt <= Date.now()
  resets.splice(index, 1)
  saveResets(resets)

  return !isExpired
}
