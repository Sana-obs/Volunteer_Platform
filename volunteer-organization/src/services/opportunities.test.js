import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}))

import { apiClient } from './api/client'
import { fetchOpportunities, createOpportunity } from './opportunities'

function formDataToObject(formData) {
  const result = {}
  for (const [key, value] of formData.entries()) {
    if (key in result) {
      result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value]
    } else {
      result[key] = value
    }
  }
  return result
}

// شكل OpportunityResource الحقيقي — مأخوذ حرفيًا من فحص الكود مباشرة
// (app/Http/Resources/OpportunityResource.php)
const REAL_OPPORTUNITY = {
  id: 1,
  title: 'Beach Cleanup',
  description: 'Help clean the coastline',
  city: { id: 1, nameEn: 'Damascus', nameAr: 'دمشق' },
  start_date: '2026-09-01T10:00:00.000000Z',
  end_date: '2026-09-02T10:00:00.000000Z',
  register_start_at: null,
  register_end_at: '2026-08-30T10:00:00.000000Z',
  min_hours: 2,
  max_hours: 5,
  total_hours: 10,
  current_volunteers: 3,
  max_volunteers: 10,
  registration_closed_manually: false,
  status: 'registration_open',
  category: { id: 2, name: 'Environment' },
  skills: [{ id: 1, name: 'Teaching' }],
  organization: { id: 5, name: 'Green Coast', image_url: 'https://backend.local/logo.png' },
  image: null,
  is_group: false,
  registrationClosedReason: null,
}

// نفس القائمة الحقيقية الراجعة فعليًا من GET /governorates (تأكيد حي) —
// راجع CRIT-3 بـ syrianGovernorates.js لسبب لزوم تمريرها صراحة الآن
const REAL_GOVERNORATES = [{ id: 1, nameEn: 'Damascus', nameAr: 'دمشق', slug: 'damascus', isActive: true }]

describe('fetchOpportunities — تطبيع شكل OpportunityResource الحقيقي (snake_case + city/organization متداخلين)', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('يحوّل city المتداخل لـ location نصي، وباقي الحقول لـ camelCase', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_OPPORTUNITY] })

    const [opportunity] = await fetchOpportunities({}, REAL_GOVERNORATES)

    expect(opportunity.location).toBe('Damascus')
    expect(opportunity.startDate).toBe('2026-09-01T10:00:00.000000Z')
    expect(opportunity.minHours).toBe(2)
    expect(opportunity.maxHours).toBe(5)
    expect(opportunity.currentVolunteers).toBe(3)
    expect(opportunity.maxVolunteers).toBe(10)
    expect(opportunity.registrationClosedManually).toBe(false)
  })

  it('يحوّل organization.image_url لـ organization.imageUrl (مش profile_image الخاطئ سابقًا)', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_OPPORTUNITY] })

    const [opportunity] = await fetchOpportunities({}, REAL_GOVERNORATES)

    expect(opportunity.organization.imageUrl).toBe('https://backend.local/logo.png')
  })

  it('category وskills يضلّوا كما هم (شكلهم أصلًا مطابق)', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_OPPORTUNITY] })

    const [opportunity] = await fetchOpportunities({}, REAL_GOVERNORATES)

    expect(opportunity.category).toEqual({ id: 2, name: 'Environment' })
    expect(opportunity.skills).toEqual([{ id: 1, name: 'Teaching' }])
  })
})

describe('createOpportunity — تطابق الحقول المرسلة مع OpportunityRequest الحقيقي', () => {
  beforeEach(() => {
    apiClient.post.mockReset()
    apiClient.post.mockResolvedValue({ data: REAL_OPPORTUNITY })
  })

  it('يرسل governorate_id رقمي (مش city/location نصي) وcategory_id (مش categoryId)', async () => {
    await createOpportunity({
      title: 'Beach Cleanup',
      description: 'desc',
      categoryId: 2,
      location: 'Damascus',
      skills: [{ id: 1, name: 'Teaching' }],
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      minHours: 2,
      maxHours: 5,
      totalHours: 10,
      maxVolunteers: 10,
    }, REAL_GOVERNORATES)

    const sentFormData = apiClient.post.mock.calls[0][1]
    const fields = formDataToObject(sentFormData)

    expect(fields.governorate_id).toBe('1')
    expect(fields.category_id).toBe('2')
    expect(fields.city).toBeUndefined()
    expect(fields.categoryId).toBeUndefined()
  })

  it('يرسل skills كمصفوفة فعلية (skills[]) مش JSON.stringify بحقل واحد', async () => {
    await createOpportunity({
      title: 'Beach Cleanup',
      description: 'desc',
      categoryId: 2,
      location: 'Damascus',
      skills: [{ id: 1, name: 'Teaching' }, { id: 2, name: 'First Aid' }],
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      minHours: 2,
      maxHours: 5,
      totalHours: 10,
      maxVolunteers: 10,
    })

    const sentFormData = apiClient.post.mock.calls[0][1]
    const fields = formDataToObject(sentFormData)

    expect(fields['skills[]']).toEqual(['1', '2'])
  })

  it('يرسل min_volunteers (snake_case) — صار حقلًا مطلوبًا بالباك اند (OpportunityRequest)', async () => {
    await createOpportunity({
      title: 'Beach Cleanup',
      description: 'desc',
      categoryId: 2,
      location: 'Damascus',
      skills: [{ id: 1, name: 'Teaching' }],
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      minHours: 2,
      maxHours: 5,
      totalHours: 10,
      minVolunteers: 5,
      maxVolunteers: 10,
    })

    const sentFormData = apiClient.post.mock.calls[0][1]
    const fields = formDataToObject(sentFormData)

    expect(fields.min_volunteers).toBe('5')
    expect(fields.minVolunteers).toBeUndefined()
  })
})
