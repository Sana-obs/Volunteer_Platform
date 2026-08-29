import { ACCOUNT_TYPES } from '../constants/auth/accountTypes'
import { apiClient, getApiErrorMessage, getApiFieldErrors } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { normalizeUser } from '../utils/auth/normalizeUser'
import { validateAuthResponse } from '../utils/api/apiResponseSchemas'
import { AUTH_STORAGE_KEY } from '../constants/auth/storage'
import { ROUTES } from '../constants/paths'
import { loadMockUsers, saveMockUsers, updateMockUser } from './mock/mockUserStore'
import { generateResetToken, consumeResetToken } from './mock/mockPasswordResetStore'

const MOCK_MODE = isMockMode()

function getCurrentSessionEmail() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)?.user?.email || null
  } catch {
    return null
  }
}

// إزالة كلمة المرور من بيانات المستخدم قبل تخزينها في الـ Context
function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return null
  const safeUser = { ...user }
  delete safeUser.password
  return safeUser
}

// استخراج ملف واحد سواء وصل كـ FileList (من react-hook-form) أو كـ File مباشرة
function extractFile(value) {
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null
  return value || null
}

const LARAVEL_FIELD_TO_FORM_FIELD = {
  email: 'email',
  password: 'password',
  phone_number: 'phone',
  first_name: 'firstName',
  last_name: 'lastName',
  organization_name: 'orgName',
  contact_person: 'contactPerson',
  verification_document: 'verificationImage',
  password_confirmation: 'confirmPassword',
}

// أي حقل ما إله مقابل معروف (نادر) بيضل بإسمه الأصلي بدل ما يُفقد بصمت
function translateFieldErrors(rawFieldErrors) {
  if (!rawFieldErrors) return null

  const translated = {}
  Object.entries(rawFieldErrors).forEach(([laravelField, message]) => {
    const formField = LARAVEL_FIELD_TO_FORM_FIELD[laravelField] || laravelField
    translated[formField] = message
  })

  return translated
}

const BACKEND_ADMIN_ROLE = 'platform-admin'

function resolveAccountType(data) {
  const roles = data?.roles
  if (Array.isArray(roles)) {
    
    if (roles.includes(BACKEND_ADMIN_ROLE) || roles.includes(ACCOUNT_TYPES.ADMIN)) return ACCOUNT_TYPES.ADMIN
    if (roles.includes(ACCOUNT_TYPES.ORGANIZATION)) return ACCOUNT_TYPES.ORGANIZATION
    if (roles.includes(ACCOUNT_TYPES.VOLUNTEER)) return ACCOUNT_TYPES.VOLUNTEER
  }

  if (data?.accountType === ACCOUNT_TYPES.ADMIN) return ACCOUNT_TYPES.ADMIN
  if (data?.accountType === ACCOUNT_TYPES.ORGANIZATION) return ACCOUNT_TYPES.ORGANIZATION
  if (data?.accountType === ACCOUNT_TYPES.VOLUNTEER) return ACCOUNT_TYPES.VOLUNTEER

  return null
}


function buildAuthPayload(responseData, fallbackEmail = '', governorates = []) {
  const apiUser = responseData?.user
  const apiToken = responseData?.token

  const user = normalizeUser(sanitizeUser(apiUser || responseData), governorates)
  const accountType = resolveAccountType(apiUser || responseData)

  const tokenFromApi = typeof apiToken === 'string' ? apiToken : null
  const token = tokenFromApi || `mock-token-${fallbackEmail || 'user'}-${Date.now()}`

  return { user, token, accountType }
}

function buildRegisterFormData(payload) {
  const formData = new FormData()

  formData.append('account_type', payload.accountType)
  formData.append('email', payload.email.trim().toLowerCase())
  formData.append('password', payload.password)
  formData.append('password_confirmation', payload.password)

  formData.append('phone_number', payload.phone)

  if (payload.accountType === ACCOUNT_TYPES.VOLUNTEER) {
    formData.append('first_name', payload.firstName)
    formData.append('last_name', payload.lastName)
  } else {
    formData.append('organization_name', payload.orgName)
    formData.append('contact_person', payload.contactPerson)

    const verificationFile = extractFile(payload.verificationImage)
    if (verificationFile) formData.append('verification_document', verificationFile)
  }

  return formData
}

export async function registerUser(payload, governorates = []) {
  await wait()

  if (MOCK_MODE) {
    const mockUsers = loadMockUsers()
    const normalizedEmail = payload.email.trim().toLowerCase()
    const existingUser = mockUsers.find((user) => user.email === normalizedEmail)

    if (existingUser) return { success: false, error: 'Email is already registered' }

    const accountType = payload.accountType || ACCOUNT_TYPES.VOLUNTEER

    const normalizedUser = {
      ...payload,
      accountType,
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      ...(accountType === ACCOUNT_TYPES.ORGANIZATION ? { organizationId: `org-${Date.now()}` } : {}),
    }

    mockUsers.push(normalizedUser)
    saveMockUsers(mockUsers)

    return { success: true, data: buildAuthPayload(normalizedUser, normalizedEmail, governorates) }
  }

  try {
    const formData = buildRegisterFormData(payload)
    const response = await apiClient.post('/register', formData)

    const validation = validateAuthResponse(response.data)
    if (!validation.success) return validation

    return {
      success: true,
      data: buildAuthPayload(validation.data, payload.email.trim().toLowerCase(), governorates),
    }
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error, 'Unable to register account'),
      fieldErrors: translateFieldErrors(getApiFieldErrors(error)),
    }
  }
}

export async function loginUser(payload, governorates = []) {
  await wait()

  if (MOCK_MODE) {
    const mockUsers = loadMockUsers()
    const normalizedEmail = payload.email.trim().toLowerCase()
    const existingUser = mockUsers.find((user) => user.email === normalizedEmail)

    if (!existingUser || existingUser.password !== payload.password) {
      return { success: false, error: 'Invalid email or password' }
    }

  
    let userForSession = existingUser
    const patch = {}
    if (existingUser.accountType === ACCOUNT_TYPES.ORGANIZATION && !existingUser.organizationId) {
      patch.organizationId = `org-${Date.now()}`
    }
    if (!existingUser.createdAt) {
      patch.createdAt = new Date().toISOString()
    }
    if (Object.keys(patch).length > 0) {
      userForSession = { ...existingUser, ...patch }
      const index = mockUsers.findIndex((user) => user.email === normalizedEmail)
      mockUsers[index] = userForSession
      saveMockUsers(mockUsers)
    }

    return {
      success: true,
      data: buildAuthPayload(userForSession, normalizedEmail, governorates),
    }
  }

  try {
    const response = await apiClient.post('/login', payload)

    const validation = validateAuthResponse(response.data)
    if (!validation.success) return validation

    return {
      success: true,
      data: buildAuthPayload(validation.data, payload.email.trim().toLowerCase(), governorates),
    }
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error, 'Unable to sign in'),
      fieldErrors: translateFieldErrors(getApiFieldErrors(error)),
    }
  }
}

// تحديث بروفايل حساب الأدمن (اسم/إيميل/هاتف فقط — لا حقول متطوع)
export async function updateAdminProfile(payload) {
  await wait()

  if (MOCK_MODE) {
    const email = getCurrentSessionEmail()
    if (!email) return { success: false, error: 'No active admin session found' }

    const updatedUser = updateMockUser(email, {
      name: payload.name?.trim() || '',
      email: payload.email?.trim().toLowerCase() || email,
      phone: payload.phone?.trim() || '',
    })

    if (!updatedUser) return { success: false, error: 'Admin account not found' }

    return { success: true, data: normalizeUser(sanitizeUser(updatedUser)) }
  }

  try {
  
    const [firstName, ...restName] = String(payload.name || '').trim().split(/\s+/)

    const response = await apiClient.put('/admin/profile', {
      first_name: firstName || '',
      last_name: restName.join(' ') || firstName || '',
      email: payload.email,
      phone_number: payload.phone,
    })
    return { success: true, data: normalizeUser(sanitizeUser(response.data)) }
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error, 'Unable to update the admin profile'),
      fieldErrors: translateFieldErrors(getApiFieldErrors(error)),
    }
  }
}

// تغيير كلمة مرور حساب الأدمن — يتحقق من كلمة المرور الحالية بوضع الـ
// Mock قبل الاستبدال (نفس السلوك المتوقّع من أي endpoint حقيقي)
export async function changeAdminPassword(payload) {
  await wait()

  if (MOCK_MODE) {
    const email = getCurrentSessionEmail()
    if (!email) return { success: false, error: 'No active admin session found' }

    const mockUsers = loadMockUsers()
    const existingUser = mockUsers.find((user) => user.email === email)

    if (!existingUser || existingUser.password !== payload.currentPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }

    updateMockUser(email, { password: payload.newPassword })
    return { success: true, data: {} }
  }

  try {
  
    await apiClient.put('/admin/password', {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      newPassword_confirmation: payload.newPassword,
    })
    return { success: true, data: {} }
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error, 'Unable to update the password'),
      fieldErrors: translateFieldErrors(getApiFieldErrors(error)),
    }
  }
}

export async function requestPasswordReset({ email }) {
  await wait()

  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (MOCK_MODE) {
    const mockUsers = loadMockUsers()
    const existingUser = mockUsers.find((user) => user.email === normalizedEmail)

    if (existingUser) {
      const token = generateResetToken(normalizedEmail)
      const resetLink = `${window.location.origin}${ROUTES.RESET_PASSWORD}?token=${token}&email=${encodeURIComponent(normalizedEmail)}`
      console.info('[Mock] Password reset link:', resetLink)
    }

    return { success: true, data: {} }
  }

  try {
    await apiClient.post('/forgot-password', { email: normalizedEmail })
    return { success: true, data: {} }
  } catch (error) {
    return {
      success: false,
      error: getApiErrorMessage(error, 'Unable to send reset link'),
      fieldErrors: translateFieldErrors(getApiFieldErrors(error)),
    }
  }
}

export async function resetPassword({ token, email, password, passwordConfirmation }) {
  await wait()

  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (MOCK_MODE) {
    const isValidToken = consumeResetToken({ email: normalizedEmail, token })
    const updatedUser = isValidToken ? updateMockUser(normalizedEmail, { password }) : null

    if (!updatedUser) {
      return {
        success: false,
        error: 'This password reset link is invalid or has expired.',
        isTokenError: true,
      }
    }

    return { success: true, data: {} }
  }

  try {

    await apiClient.post('/reset-password', {
      token,
      email: normalizedEmail,
      password,
      password_confirmation: passwordConfirmation,
    })
    return { success: true, data: {} }
  } catch (error) {
    const rawFieldErrors = getApiFieldErrors(error) || {}
    const { token: tokenFieldError, ...restFieldErrors } = rawFieldErrors

    return {
      success: false,
      error: getApiErrorMessage(error, 'Unable to reset password'),
      fieldErrors: translateFieldErrors(restFieldErrors),
      isTokenError: Boolean(tokenFieldError),
    }
  }
}