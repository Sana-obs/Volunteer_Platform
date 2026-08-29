
import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { AUTH_STORAGE_KEY } from '../constants/auth/storage'
import { updateMockUser } from './mock/mockUserStore'
import { readFileAsDataUrl } from './api/fileToDataUrl'
import { getGovernorateBySelectValue, getGovernorateSelectValueFromApiCity } from './syrianGovernorates'
import { extractPhotoUrl } from '../utils/extractPhotoUrl'

const MOCK_MODE = isMockMode()

// إيميل الجلسة الحالية — نفس النمط المستخدم بـ services/organization.js
function getCurrentSessionEmail() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)?.user?.email || null
  } catch {
    return null
  }
}

/**
 * @param {Array<{id:number, nameEn:string}>} [governorates] - القائمة الحقيقية (useCitiesQuery) لتحويل city
 * @returns {Promise<object|null>}
 */
export async function fetchVolunteerProfile(governorates = []) {
  if (MOCK_MODE) return null

  try {
    const response = await apiClient.get('/volunteers/me')
    const data = response.data ?? {}

    return {
      educationLevel: data.education_level ?? '',
      dateOfBirth: data.birth_date ?? '',
      gender: data.gender ?? '',
      city: getGovernorateSelectValueFromApiCity(data.city, governorates) ?? '',
      about: data.about ?? '',
      skillNames: Array.isArray(data.skills) ? data.skills : [],
      imageUrl: extractPhotoUrl(data.photo),
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load your profile'), { cause: error })
  }
}

function buildVolunteerFormData({ values, photoFile, removePhoto }, governorates = []) {
  const formData = new FormData()


    const governorate = getGovernorateBySelectValue(values.city, governorates)

    formData.append('education_level', values.educationLevel || '')
    formData.append('birth_date', values.dateOfBirth || '')
    formData.append('gender', (values.gender || '').toLowerCase())
    formData.append('governorate_id', governorate?.id ?? '')
    formData.append('about', values.about || '')
    values.skills?.forEach((skillId) => formData.append('skills[]', skillId))

  if (photoFile) {
    formData.append('photo', photoFile)
  } else if (removePhoto) {

    formData.append('photo_remove', '1')
  }

  return formData
}
async function createVolunteerProfile({ values, photoFile, removePhoto }, governorates = []) {
  try {
    const formData = buildVolunteerFormData({ values, photoFile, removePhoto }, governorates)
    const response = await apiClient.post('/volunteers', formData)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to save profile') }
  }
}

/**
 * يحفظ بروفايل المتطوع.
 * @param {number|string} volunteerId
 * @param {{ values: object, photoFile?: File }} payload - بيانات الفورم الخام + الصورة (اختياري)
 * @returns {Promise<{success: boolean, data?: {imageUrl?: string}, error?: string}>}
 */
export async function updateVolunteerProfile(volunteerId, { values, photoFile, removePhoto } = {}, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    const imageUrl = photoFile ? await readFileAsDataUrl(photoFile) : undefined
    const email = getCurrentSessionEmail()

    if (email) {
      updateMockUser(email, {
        educationLevel: values?.educationLevel || '',
        dateOfBirth: values?.dateOfBirth || '',
        gender: values?.gender || '',
        city: values?.city || '',
        about: values?.about || '',
        skillIds: values?.skills || [],
        ...(imageUrl ? { imageUrl } : removePhoto ? { imageUrl: '' } : {}),
      })
    }

    return { success: true, data: { imageUrl: imageUrl ?? (removePhoto ? '' : undefined) } }
  }

  if (!volunteerId) {
    return { success: false, error: 'Volunteer id is required to update the profile' }
  }

  try {
    const formData = buildVolunteerFormData({ values, photoFile, removePhoto }, governorates)

    // IMPORTANT:
    // PHP does NOT read files in PUT multipart/form-data.
    // So we send POST + _method: PUT to allow Laravel to process the file.
    formData.append('_method', 'PUT')

    const response = await apiClient.post(`/volunteers/me`, formData, {
      headers: { 'Content-Type': undefined }, // allow browser to set boundary
    })

    return { success: true, data: response.data }
  } catch (error) {
    if (error.response?.status === 404) {
      return createVolunteerProfile({ values, photoFile, removePhoto }, governorates)
    }

    return { success: false, error: getApiErrorMessage(error, 'Failed to save profile') }
  }
}