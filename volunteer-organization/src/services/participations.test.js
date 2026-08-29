import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}))

import { apiClient } from './api/client'
import { fetchApplicantsForOpportunity } from './participations'

// شكل applicant.volunteer الفعلي (ParticipationResource::volunteer -> UserResource
// كامل، مع volunteer المتداخل جوّاه) — مأخوذ من نفس الشكل الحقيقي المُلتقط
// حيًا بـ POST /login لحساب متطوع
const REAL_APPLICANT = {
  id: 5,
  status: 'pending',
  participatedAt: '2026-08-25',
  committedHours: 4,
  hoursLogged: null,
  volunteer: {
    id: 13,
    first_name: 'Lana',
    last_name: 'Test',
    email: 'lana.testvol1@example.com',
    phone_number: '0999999999',
    roles: ['volunteer'],
    volunteer: {
      id: 3,
      gender: 'male',
      city: { id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق' },
      education_level: 'High School',
      birth_date: '2000-01-01',
      about: 'updated about',
      photo: null,
      skills: ['Tutoring'],
    },
    organization: null,
  },
}

// نفس القائمة الحقيقية الراجعة فعليًا من GET /governorates (تأكيد حي) —
// راجع CRIT-3 بـ syrianGovernorates.js لسبب لزوم تمريرها صراحة الآن
const REAL_GOVERNORATES = [{ id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق', slug: 'rif-dimashq', isActive: true }]

describe('fetchApplicantsForOpportunity — تسطيح applicant.volunteer (UserResource متداخل)', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('يبني name من first_name/last_name (ما في حقل name مسطّح على UserResource)', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_APPLICANT] })

    const [applicant] = await fetchApplicantsForOpportunity('1')

    expect(applicant.volunteer.name).toBe('Lana Test')
  })

  it('يستخرج phone/city/skills من الشكل المتداخل volunteer.volunteer.* بدل ما تضل undefined', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_APPLICANT] })

    const [applicant] = await fetchApplicantsForOpportunity('1', REAL_GOVERNORATES)

    expect(applicant.volunteer.phone).toBe('0999999999')
    expect(applicant.volunteer.city).toBe('Rif Dimashq')
    expect(applicant.volunteer.skills).toEqual(['Tutoring'])
  })

  it('email يضل شغّال (كان أصلًا مسطّح على مستوى أول حتى قبل الإصلاح)', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_APPLICANT] })

    const [applicant] = await fetchApplicantsForOpportunity('1')

    expect(applicant.volunteer.email).toBe('lana.testvol1@example.com')
  })
})
