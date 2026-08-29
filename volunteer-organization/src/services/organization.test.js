import { describe, it, expect, vi, beforeEach } from 'vitest'

// نجبر updateOrganizationProfile على مسار الـ API الحقيقي — نفس نمط
// notifications.test.js بالضبط
vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { post: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}))

import { apiClient } from './api/client'
import { updateOrganizationProfile } from './organization'

function formDataToObject(formData) {
  const result = {}
  for (const [key, value] of formData.entries()) {
    result[key] = value
  }
  return result
}

// نفس القائمة الحقيقية الراجعة فعليًا من GET /governorates (تأكيد حي) —
// راجع CRIT-3 بـ syrianGovernorates.js لسبب لزوم تمريرها صراحة الآن
const REAL_GOVERNORATES = [{ id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق', slug: 'rif-dimashq', isActive: true }]

describe('updateOrganizationProfile — تطابق الحقول المرسلة مع UpdateOrganizationRequest.php الحقيقي', () => {
  beforeEach(() => {
    apiClient.post.mockReset()
    apiClient.post.mockResolvedValue({ data: { profile_image: null } })
  })

  it('يرسل governorate_id رقمي (مش city نصي) — الباك اند ما عنده عمود city إطلاقًا بجدول organizations', async () => {
    await updateOrganizationProfile(
      '7',
      { values: { name: 'Test Org', description: 'desc', city: 'Rif Dimashq', website: '' } },
      REAL_GOVERNORATES,
    )

    const sentFormData = apiClient.post.mock.calls[0][1]
    const fields = formDataToObject(sentFormData)

    expect(fields.governorate_id).toBe('2')
    expect(fields.city).toBeUndefined()
  })

  it('ما يرسل contact_person إطلاقًا — الفورم ما فيها هيك حقل، وإرسالها فاضية كانت تفشّل الطلب (sometimes|required)', async () => {
    await updateOrganizationProfile('7', {
      values: { name: 'Test Org', description: 'desc', city: 'Damascus', website: '' },
    })

    const sentFormData = apiClient.post.mock.calls[0][1]
    const fields = formDataToObject(sentFormData)

    expect(fields.contact_person).toBeUndefined()
  })

  it('يرسل photo_remove (مش remove_photo) عند حذف الشعار — الاسم القديم كان يُتجاهل بصمت من الباك اند', async () => {
    await updateOrganizationProfile('7', {
      values: { name: 'Test Org', description: 'desc', city: 'Damascus', website: '' },
      removePhoto: true,
    })

    const sentFormData = apiClient.post.mock.calls[0][1]
    const fields = formDataToObject(sentFormData)

    expect(fields.photo_remove).toBe('1')
    expect(fields.remove_photo).toBeUndefined()
  })
})
