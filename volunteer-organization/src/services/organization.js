
import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { ORGANIZATION_STATUS } from '../constants/organizationStatus'
import { AUTH_STORAGE_KEY } from '../constants/auth/storage'
import { loadMockUsers, updateMockUser } from './mock/mockUserStore'
import { validateOrganizationProfileResponse } from '../utils/api/apiResponseSchemas'
import { readFileAsDataUrl } from './api/fileToDataUrl'
import { getGovernorateBySelectValue } from './syrianGovernorates'

const MOCK_MODE = isMockMode()

// إيميل المستخدم المسجّل دخوله حاليًا (من نفس الجلسة يلي AuthContext خزّنها)
// نستخدمه فقط بوضع الـ Mock للبحث داخل mockUsers
function getCurrentSessionEmail() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)?.user?.email || null
  } catch {
    return null
  }
}

const EMPTY_ORGANIZATION = {
  id: null,
  name: '',
  email: '',
  contactPerson: '',
  description: '',
  city: '',
  website: '',
  verificationDocumentUrl: null,
  status: ORGANIZATION_STATUS.PENDING,
  owner: null,
}

/**

 * @param {number|string} organizationId - يجب أن يصل من AuthContext (user.organization.id)
 * @returns {Promise<object>}
 */
export async function fetchOrganizationProfile(organizationId, governorates = []) {
  if (MOCK_MODE) {
    await wait()

    const email = getCurrentSessionEmail()
    const mockUser = email ? loadMockUsers().find((u) => u.email === email) : null

    if (!mockUser) return EMPTY_ORGANIZATION

    return {
      id: mockUser.organizationId || null,
      name: mockUser.orgName || '',
      email: mockUser.email || '',
      contactPerson: mockUser.contactPerson || '',
      description: mockUser.description || '',
      city: mockUser.city || '',
      website: mockUser.website || '',
      imageUrl: mockUser.imageUrl || null,
      verificationDocumentUrl: mockUser.verificationDocumentUrl || null,
      status: mockUser.status || ORGANIZATION_STATUS.PENDING,
      owner: { id: mockUser.id, name: mockUser.name, email: mockUser.email },
    }
  }

  if (!organizationId) {
    throw new Error('Organization id is required to load the profile')
  }

  try {
    const response = await apiClient.get(`/organizations/${organizationId}`)

    // نتحقق من شكل الاستجابة (OrganizationResource الحقيقي) قبل ما توصل
    // لأي Component — لو حقل ناقص أو النوع غلط، هون التحقق بيرجّع خطأ واضح
    const validation = validateOrganizationProfileResponse(response.data, governorates)
    if (!validation.success) throw new Error(validation.error)

    return validation.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load organization profile'), { cause: error })
  }
}

/**
 *
 * @param {number|string} organizationId
 * @param {{ values: {name: string, description: string, city: string, website?: string}, photoFile?: File, removePhoto?: boolean }} payload
 */
export async function updateOrganizationProfile(organizationId, { values, photoFile, removePhoto } = {}, governorates = []) {
  if (MOCK_MODE) {
    await wait()

    // ⚠️ Data URL هون، مش URL.createObjectURL — نفس سبب services/volunteer.js
    // بالضبط: بيتخزّن بـ localStorage وازم يضل صالح بعد أي reload
    const imageUrl = photoFile ? await readFileAsDataUrl(photoFile) : undefined
    const email = getCurrentSessionEmail()

    if (email) {
      updateMockUser(email, {
        orgName: values?.name || '',
        description: values?.description || '',
        city: values?.city || '',
        website: values?.website || '',
        contactPerson: values?.contactPerson || '',
        ...(imageUrl ? { imageUrl } : removePhoto ? { imageUrl: '' } : {}),
      })
    }

    return { success: true, data: { imageUrl: imageUrl ?? (removePhoto ? '' : undefined) } }
  }

  if (!organizationId) {
    return { success: false, error: 'Organization id is required to update the profile' }
  }

  try {
    const formData = new FormData()
    formData.append('name', values?.name || '')
    formData.append('description', values?.description || '')

    const governorate = getGovernorateBySelectValue(values?.city, governorates)
    if (governorate) formData.append('governorate_id', governorate.id)

    formData.append('website', values?.website || '')
    if (photoFile) {
      formData.append('photo', photoFile)
    } else if (removePhoto) {
      formData.append('photo_remove', '1')
    }
    formData.append('_method', 'PUT')

    const response = await apiClient.post(`/organizations/${organizationId}`, formData, {
      headers: { 'Content-Type': undefined }, // يخلي المتصفح يحدد الـ boundary تلقائيًا
    })

      return { success: true, data: { ...response.data, imageUrl: response.data?.profile_image ?? undefined } }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to save organization profile') }
  }
}


/**
 * @param {number|string} organizationId
 * @param {{file: File, previewUrl: string}} document - previewUrl هي معاينة
 *   base64 محلية جاهزة أصلًا من useImageUpload، نستخدمها بوضع mock فقط
 *   كبديل لرابط تخزين حقيقي (ما في سيرفر فعلي يرفع له الملف بهالوضع)
 * @returns {Promise<{success: boolean, error?: string, data?: object}>}
 */
export async function resubmitVerificationDocument(organizationId, { file, previewUrl }) {
  if (!file) return { success: false, error: 'Please select a document to upload' }

  if (MOCK_MODE) {
    await wait()

    const email = getCurrentSessionEmail()
    if (!email) return { success: false, error: 'Could not identify the current organization' }

    const updated = updateMockUser(email, {
      verificationDocumentUrl: previewUrl,
      status: ORGANIZATION_STATUS.PENDING,
      rejectionReason: '',
    })

    return { success: true, data: { verificationDocumentUrl: updated?.verificationDocumentUrl } }
  }

  if (!organizationId) {
    return { success: false, error: 'Organization id is required to resubmit the document' }
  }

  try {
    const formData = new FormData()
    formData.append('verification_document', file)

    const response = await apiClient.post(`/organizations/${organizationId}/verification-document`, formData)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to upload the new document') }
  }
}