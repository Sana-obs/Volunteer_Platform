
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '../../constants/media'

/**
 * يتحقق من ملف الصورة قبل إرساله (النوع والحجم).
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'Please select an image to upload.' }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPG, PNG, or WEBP only).' }
  }

  const maxSizeBytes = MAX_IMAGE_SIZE_MB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image size must not exceed ${MAX_IMAGE_SIZE_MB}MB.` }
  }

  return { valid: true }
}

/**
 * @param {Object} fields - باقي حقول الفورم (نص/أرقام)
 * @param {{ file?: File, fieldName?: string }} imageInput - الصورة الفعلية
 * @param {'POST'|'PUT'} httpMethod - نوع الطلب الحقيقي المطلوب بالباك اند
 * @returns {FormData}
 */
export function buildMultipartFormData(fields = {}, imageInput = {}, httpMethod = 'POST') {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    formData.append(key, value)
  })

  const { file, fieldName = 'photo' } = imageInput
  if (file) formData.append(fieldName, file)

  
  if (httpMethod === 'PUT') formData.append('_method', 'PUT')

  return formData
}