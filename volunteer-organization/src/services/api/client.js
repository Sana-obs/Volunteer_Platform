import axios from 'axios'
import { AUTH_STORAGE_KEY, SESSION_EXPIRED_STORAGE_KEY } from '../../constants/auth/storage'
import { ROUTES } from '../../constants/paths'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// بدون هاد، طلب معلَّق (سيرفر لا يرد، لا خطأ صريح) كان ينتظر بلا أي حدّ
// زمني فعلي — بيضل "جاري التحميل" للأبد بدل ما يفشل بوقت معقول ويعرض
// رسالة واضحة للمستخدم
const REQUEST_TIMEOUT_MS = 15000

// لا نضبط Content-Type بشكل ثابت هنا: axios يحدده تلقائيًا
// (application/json للكائنات العادية، أو multipart/form-data مع الـ boundary الصحيح عند إرسال FormData)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
})

apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return config

    const { token } = JSON.parse(raw)
    if (typeof token === 'string' && token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore invalid session payload
  }

  return config
})

function unwrapLaravelEnvelope(response) {
  const body = response.data

  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    response.meta = body.meta
    response.links = body.links
    response.data = body.data
  }

  return response
}

apiClient.interceptors.response.use(
  (response) => unwrapLaravelEnvelope(response),
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {

      const hadSession = Boolean(localStorage.getItem(AUTH_STORAGE_KEY))
      localStorage.removeItem(AUTH_STORAGE_KEY)

      // تجنّب حلقة تحويل لا نهائية لو الـ 401 صار أصلًا من صفحة تسجيل الدخول نفسها
      if (hadSession && window.location.pathname !== ROUTES.LOGIN) {

        try {
          sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, '1')
        } catch {
        }

        window.location.assign(ROUTES.LOGIN)
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The request took too long to respond. Please check your connection and try again.'
    }

    if (!error.response) {
      return 'Unable to reach the server. Please check your internet connection and try again.'
    }

    return error.response?.data?.message || error.response?.data?.error || error.message || fallbackMessage
  }

  if (error instanceof Error) return error.message

  return fallbackMessage
}

export function getApiFieldErrors(error) {
  if (!axios.isAxiosError(error)) return null

  const errors = error.response?.data?.errors
  if (!errors || typeof errors !== 'object') return null

  const fieldErrors = {}
  Object.entries(errors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      fieldErrors[field] = messages[0]
    }
  })

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null
}