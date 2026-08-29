import { describe, it, expect } from 'vitest'
import { validateOrganizationProfileResponse } from './apiResponseSchemas'

// شكل استجابة OrganizationResource.php الفعلي (GET /organizations/{id})
// — مأخوذ حرفيًا من قراءة الكود مباشرة (app/Http/Resources/OrganizationResource.php)،
// city متداخل كـ {id, nameEn, nameAr}
const REAL_ORGANIZATION_RESPONSE = {
  id: 7,
  name: 'Test Org',
  description: 'A test organization description that is long enough.',
  city: { id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق' },
  contact_person: 'Lana Contact',
  website: null,
  owner: { id: 14, name: 'Test Org', email: 'org@example.com' },
  profile_image: null,
  verification_document: 'https://backend.local/storage/doc.pdf',
  status: 'pending',
}

// نفس القائمة الحقيقية الراجعة فعليًا من GET /governorates (تأكيد حي) —
// راجع CRIT-3 بـ syrianGovernorates.js لسبب لزوم تمريرها صراحة الآن
const REAL_GOVERNORATES = [{ id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق', slug: 'rif-dimashq', isActive: true }]

describe('validateOrganizationProfileResponse — تحويل city المتداخل من الباك اند الحقيقي', () => {
  it('لا يفشل التحقق لما city يوصل ككائن متداخل {id, nameEn, nameAr} (شكل الباك اند الحقيقي)', () => {
    const result = validateOrganizationProfileResponse(REAL_ORGANIZATION_RESPONSE, REAL_GOVERNORATES)
    expect(result.success).toBe(true)
  })

  it('يحوّل city لنفس قيمة الاختيار المستخدمة بفورم البروفايل (id=2 -> "Rif Dimashq") عبر القائمة الحقيقية الممرَّرة', () => {
    const result = validateOrganizationProfileResponse(REAL_ORGANIZATION_RESPONSE, REAL_GOVERNORATES)
    expect(result.data.city).toBe('Rif Dimashq')
  })

  it('يرجّع city فاضي (مش خطأ) لو ما تم تمرير القائمة الحقيقية إطلاقًا — بدل الرجوع للمصفوفة المحلية الخاطئة الترتيب', () => {
    const result = validateOrganizationProfileResponse(REAL_ORGANIZATION_RESPONSE)
    expect(result.success).toBe(true)
    expect(result.data.city).toBe('')
  })

  it('يرجّع city فاضي (مش خطأ) لما تكون null', () => {
    const result = validateOrganizationProfileResponse(
      { ...REAL_ORGANIZATION_RESPONSE, city: null },
      REAL_GOVERNORATES,
    )
    expect(result.success).toBe(true)
    expect(result.data.city).toBe('')
  })

  it('ما بيلمس شكل نص مسطّح أصلًا (توافق مستقبلي لو الباك اند تغيّر)', () => {
    const result = validateOrganizationProfileResponse(
      { ...REAL_ORGANIZATION_RESPONSE, city: 'Damascus' },
      REAL_GOVERNORATES,
    )
    expect(result.success).toBe(true)
    expect(result.data.city).toBe('Damascus')
  })
})
