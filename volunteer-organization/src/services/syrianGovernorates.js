import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { closeCityOpportunitiesRegistration } from './opportunities'

const MOCK_MODE = isMockMode()

export const syrianGovernorates = [
  { id: 1,  nameEn: "Damascus", nameAr: "دمشق", slug: "damascus", isActive: true },
  { id: 2,  nameEn: "Rural Damascus", nameAr: "ريف دمشق", slug: "rural-damascus", isActive: true },
  { id: 3,  nameEn: "Aleppo", nameAr: "حلب", slug: "aleppo", isActive: true },
  { id: 4,  nameEn: "Homs", nameAr: "حمص", slug: "homs", isActive: true },
  { id: 5,  nameEn: "Hama", nameAr: "حماة", slug: "hama", isActive: true },
  { id: 6,  nameEn: "Latakia", nameAr: "اللاذقية", slug: "latakia", isActive: true },
  { id: 7,  nameEn: "Tartus", nameAr: "طرطوس", slug: "tartus", isActive: true },
  { id: 8,  nameEn: "Idlib", nameAr: "إدلب", slug: "idlib", isActive: true },
  { id: 9,  nameEn: "Daraa", nameAr: "درعا", slug: "daraa", isActive: true },
  { id: 10, nameEn: "Sweida", nameAr: "السويداء", slug: "sweida", isActive: true },
  { id: 11, nameEn: "Quneitra", nameAr: "القنيطرة", slug: "quneitra", isActive: true },
  { id: 12, nameEn: "Deir ez-Zor", nameAr: "دير الزور", slug: "deir-ez-zor", isActive: true },
  { id: 13, nameEn: "Raqqa", nameAr: "الرقة", slug: "raqqa", isActive: true },
  { id: 14, nameEn: "Hasakah", nameAr: "الحسكة", slug: "hasakah", isActive: true },
];

export const SYRIAN_GOVERNORATES = syrianGovernorates;

/** عدد المحافظات السورية */
export const SYRIAN_GOVERNORATES_COUNT = syrianGovernorates.length;

/**
 * دالة مساعدة لجلب محافظة عبر الـ id
 * @param {number} id
 * @returns {object|undefined}
 */
export const getGovernorateById = (id) =>
  syrianGovernorates.find((governorate) => governorate.id === id);

/**
 * دالة مساعدة لجلب محافظة عبر الاسم الإنجليزي (nameEn)
 * مفيدة عند التعامل مع حقل "city" الذي يخزّن نصًا إنجليزيًا وليس id
 * @param {string} nameEn
 * @returns {object|undefined}
 */
export const getGovernorateByNameEn = (nameEn) =>
  syrianGovernorates.find((governorate) => governorate.nameEn === nameEn);

export const getActiveGovernorates = () =>
  syrianGovernorates.filter((governorate) => governorate.isActive !== false);

export const getGovernorateSelectValue = (nameEn) =>
  nameEn === 'Rural Damascus' ? 'Rif Dimashq' : nameEn

/**
 * @param {Array<{nameEn:string, isActive?:boolean}>} governorates 
 * @param {string} [currentValue] 
 * @returns {Array<{name:string, value:string, disabled:boolean}>}
 */
export const getGovernorateDropdownItems = (governorates, currentValue) =>
  governorates
    .filter(
      (governorate) =>
        governorate.isActive !== false || getGovernorateSelectValue(governorate.nameEn) === currentValue,
    )
    .map(({ nameEn, isActive }) => ({
      name: nameEn,
      value: getGovernorateSelectValue(nameEn),
      disabled: !isActive,
    }))

/**
  * @param {string} value
 * @param {Array<{id:number, nameEn:string}>} [governorates] - القائمة الحقيقية (مو المحلية)
 */
export const getGovernorateBySelectValue = (value, governorates = []) =>
  governorates.find((governorate) => getGovernorateSelectValue(governorate.nameEn) === value)

/**
  * @param {{id: number, nameEn?: string, nameAr?: string}|string|null|undefined} city
 * @param {Array<{id:number, nameEn:string}>} [governorates] - القائمة الحقيقية (مو المحلية)
 * @returns {string|undefined}
 */
export const getGovernorateSelectValueFromApiCity = (city, governorates = []) => {
  if (!city) return undefined
  if (typeof city === 'string') return city

  const governorate = governorates.find((item) => item.id === city.id)
  return governorate ? getGovernorateSelectValue(governorate.nameEn) : undefined
}

export default syrianGovernorates;

/**
 * يجلب قائمة المحافظات/المدن من GET /governorates — نفس نمط fetchCategories
 @returns {Promise<Array<{id:number, nameEn:string, nameAr:string, slug:string, isActive:boolean}>>}
 */
export async function fetchGovernorates() {
  if (MOCK_MODE) {
    await wait()
    return [...syrianGovernorates]
  }

  try {
    const response = await apiClient.get('/governorates')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load cities'), { cause: error })
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * @param {{nameEn: string}} payload
 */
export async function createGovernorate(payload) {
  if (MOCK_MODE) {
    await wait()

    const nameTaken = syrianGovernorates.some(
      (governorate) => governorate.nameEn.trim().toLowerCase() === payload.nameEn.trim().toLowerCase(),
    )
    if (nameTaken) return { success: false, error: 'A city with this name already exists' }

    const newGovernorate = {
      id: Date.now(),
      nameEn: payload.nameEn,
      slug: slugify(payload.nameEn),
      isActive: true,
    }
    syrianGovernorates.push(newGovernorate)
    return { success: true, data: newGovernorate }
  }

  try {
    // ⚠️ GovernorateRequest.php الحقيقي يتوقع name_en (snake_case)، مش
    // nameEn — وPOST تحت prefix('admin') فعليًا (راجع routes/api.php)
    const response = await apiClient.post('/admin/governorates', {
      name_en: payload.nameEn,
    })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to create city') }
  }
}

/**
  * @param {number|string} governorateId
 * @param {boolean} isActive - الحالة الجديدة المطلوبة (يحسبها الطرف الطالب
 */
export async function toggleGovernorateStatus(governorateId, isActive) {
  if (MOCK_MODE) {
    await wait()

    const governorate = syrianGovernorates.find((item) => item.id === governorateId)
    if (!governorate) return { success: false, error: 'City not found' }

    governorate.isActive = isActive

    if (isActive === false) {
      closeCityOpportunitiesRegistration(governorate.nameEn)
    }

    return { success: true, data: governorate }
  }

  try {
    const response = await apiClient.patch(`/admin/governorates/${governorateId}/status`, { isActive })
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to update city status') }
  }
}