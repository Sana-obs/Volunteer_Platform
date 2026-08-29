import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { get: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}))

import { apiClient } from './api/client'
import { fetchAdminVolunteers, fetchPendingOrganizations, fetchAdminOpportunities } from './admin'

// شكل GET /admin/volunteers الفعلي (نفس VolunteerResource المستخدم بـ
// GET /volunteers/me بالضبط) — لا name/email/city مسطّحة، ولا created_at،
// ولا skills_count/opportunities_joined_count إطلاقًا
const REAL_ADMIN_VOLUNTEER = {
  id: 3,
  gender: 'male',
  city: { id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق' },
  education_level: 'High School',
  birth_date: '2000-01-01',
  about: 'updated about',
  user: { first_name: 'Lana', last_name: 'Test', email: 'lana.testvol1@example.com', phone_number: '0999999999' },
  photo: null,
  skills: ['Tutoring'],
  createdAt: '2026-08-27T12:59:34.000000Z',
  opportunitiesJoinedCount: 2,
}

// نفس القائمة الحقيقية الراجعة فعليًا من GET /governorates (تأكيد حي) —
// راجع CRIT-3 بـ syrianGovernorates.js لسبب لزوم تمريرها صراحة الآن
const REAL_GOVERNORATES = [
  { id: 1, nameEn: 'Damascus', nameAr: 'دمشق', slug: 'damascus', isActive: true },
  { id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق', slug: 'rif-dimashq', isActive: true },
]

describe('fetchAdminVolunteers — تطبيع شكل VolunteerResource الحقيقي المتداخل', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('يبني name من user.first_name/last_name (غير موجودين على مستوى أول)', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_ADMIN_VOLUNTEER] })

    const [volunteer] = await fetchAdminVolunteers()

    expect(volunteer.name).toBe('Lana Test')
    expect(volunteer.email).toBe('lana.testvol1@example.com')
  })

  it('يحوّل city المتداخل لقيمة الاختيار النصية بدل الكائن الخام', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_ADMIN_VOLUNTEER] })

    const [volunteer] = await fetchAdminVolunteers(REAL_GOVERNORATES)

    expect(volunteer.city).toBe('Rif Dimashq')
  })

  it('يشتق skillsCount من طول مصفوفة skills الفعلية', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_ADMIN_VOLUNTEER] })

    const [volunteer] = await fetchAdminVolunteers()

    expect(volunteer.skillsCount).toBe(1)
  })

  it('يمرّر createdAt وopportunitiesJoinedCount الحقيقيين (صاروا متوفرين من الباك اند)', async () => {
    apiClient.get.mockResolvedValue({ data: [REAL_ADMIN_VOLUNTEER] })

    const [volunteer] = await fetchAdminVolunteers()

    expect(volunteer.createdAt).toBe('2026-08-27T12:59:34.000000Z')
    expect(volunteer.opportunitiesJoinedCount).toBe(2)
  })
})

describe('fetchPendingOrganizations — فلترة دفاعية محليًا (الباك اند يتجاهل ?status=)', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('يستبعد منظمة verified حتى لو الباك اند تجاهل status=pending ورجّع الكل', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        { id: 1, name: 'Pending Org', status: 'pending', owner: {} },
        { id: 2, name: 'Verified Org', status: 'verified', owner: {} },
      ],
    })

    const organizations = await fetchPendingOrganizations()

    expect(organizations).toHaveLength(1)
    expect(organizations[0].id).toBe(1)
  })

  // OrganizationResource الحقيقي بيرجّع تاريخ التسجيل بمفتاح camelCase
  // "requestedAt" (تأكيد حي 2026-08-29) — مش created_at/requested_at
  // snake_case. بدون قراءته صراحة، مودال "Organization details" وبطاقة
  // المراجعة كانوا يعرضوا "Registered —" دايمًا لأي منظمة حقيقية.
  it('يقرأ requestedAt من مفتاح "requestedAt" الحقيقي (camelCase) لا snake_case', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Pending Org',
          status: 'pending',
          owner: {},
          requestedAt: '2026-08-29T10:36:49.000000Z',
        },
      ],
    })

    const [organization] = await fetchPendingOrganizations()

    expect(organization.requestedAt).toBe('2026-08-29T10:36:49.000000Z')
  })
})

describe('fetchAdminOpportunities — تحويل city المتداخل (OpportunityResource الحقيقي)', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('يحوّل city لنص بدل الكائن الخام {id,nameEn,nameAr}', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Beach Cleanup',
          city: { id: 1, nameEn: 'Damascus', nameAr: 'دمشق' },
          status: 'registration_open',
          organization: { id: 5, name: 'Green Coast' },
          start_date: '2026-09-01',
        },
      ],
    })

    const [opportunity] = await fetchAdminOpportunities(REAL_GOVERNORATES)

    expect(opportunity.city).toBe('Damascus')
    expect(opportunity.organizationName).toBe('Green Coast')
  })

  // OpportunityResource صار يرجّع createdAt فعليًا (تأكيد حي 2026-08-29:
  // GET /admin/opportunities رجّع "createdAt" بقيمة حقيقية) — عمود
  // "Created" بقائمة مراقبة الفرص بلوحة الأدمن بيعتمد عليه.
  it('يمرّر createdAt الحقيقي (صار متوفرًا من OpportunityResource)', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Beach Cleanup',
          city: { id: 1, nameEn: 'Damascus' },
          status: 'registration_open',
          organization: { id: 5, name: 'Green Coast' },
          start_date: '2026-09-01T00:00:00.000000Z',
          createdAt: '2026-08-29T09:20:26.000000Z',
        },
      ],
    })

    const [opportunity] = await fetchAdminOpportunities(REAL_GOVERNORATES)

    expect(opportunity.createdAt).toBe('2026-08-29T09:20:26.000000Z')
  })
})
