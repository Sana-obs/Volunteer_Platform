import { describe, it, expect, vi, beforeEach } from 'vitest'

// نجبر create/update/toggleGovernorateStatus على مسار الـ API الحقيقي —
// لا تأثير على الدوال الصرفة (getGovernorateSelectValue...) تحت، هي
// أصلًا ما بتلمس apiClient/MOCK_MODE إطلاقًا
vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { post: vi.fn(), put: vi.fn(), patch: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}))

import { apiClient } from './api/client'
import {
  syrianGovernorates,
  getGovernorateSelectValue,
  getGovernorateBySelectValue,
  getGovernorateByNameEn,
  getActiveGovernorates,
  getGovernorateSelectValueFromApiCity,
  createGovernorate,
  toggleGovernorateStatus,
} from './syrianGovernorates'

// شكل القائمة الحقيقية الفعلية من GET /governorates (تأكيد حي مقابل
// الباك اند المحلي) — نفس القائمة يلي useCitiesQuery/fetchGovernorates
// بترجعها، تُمرَّر الآن صراحة كوسيط ثانٍ لكل دالة تحت (راجع CRIT-3).
// ⚠️ id=9..14 هون عمدًا مرتّبة بشكل مختلف عن syrianGovernorates المحلية
// فوق — هذا بالضبط الفرق اللي كان يسبب الـ bug القديم
const REAL_GOVERNORATES = [
  { id: 1, nameEn: 'Damascus', nameAr: 'دمشق', slug: 'damascus', isActive: true },
  { id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق', slug: 'rif-dimashq', isActive: true },
  { id: 9, nameEn: 'Raqqa', nameAr: 'الرقة', slug: 'raqqa', isActive: true },
  { id: 10, nameEn: 'Deir ez-Zor', nameAr: 'دير الزور', slug: 'deir-ez-zor', isActive: true },
  { id: 11, nameEn: 'Hasakah', nameAr: 'الحسكة', slug: 'hasakah', isActive: true },
  { id: 12, nameEn: 'Daraa', nameAr: 'درعا', slug: 'daraa', isActive: true },
  { id: 13, nameEn: 'Sweida', nameAr: 'السويداء', slug: 'sweida', isActive: true },
  { id: 14, nameEn: 'Quneitra', nameAr: 'القنيطرة', slug: 'quneitra', isActive: true },
]

// شكل city الحقيقي القادم من VolunteerResource/OrganizationResource
// ({id, nameEn, nameAr} متداخل) — راجع normalizeUser.js وapiResponseSchemas.js
// وadmin.js، الثلاثة بيستخدموا هالدالة تحديدًا لتفادي تكرار نفس التحويل
describe('getGovernorateSelectValueFromApiCity — تحويل city المتداخل من أي Resource حقيقي', () => {
  it('يحوّل {id: 2, nameEn: "Rif Dimashq"} لقيمة الاختيار "Rif Dimashq" عبر مطابقة الـ id بالقائمة الحقيقية الممرَّرة', () => {
    expect(
      getGovernorateSelectValueFromApiCity(
        { id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق' },
        REAL_GOVERNORATES,
      ),
    ).toBe('Rif Dimashq')
  })

  it('(CRIT-3) يحوّل id=13 (Sweida حقيقيًا) لقيمته الصحيحة رغم إنه بالمصفوفة المحلية id=13 هو Raqqa — القائمة الحقيقية الممرَّرة هي الفيصل', () => {
    expect(getGovernorateSelectValueFromApiCity({ id: 13, nameEn: 'Sweida' }, REAL_GOVERNORATES)).toBe(
      'Sweida',
    )
  })

  it('يرجّع undefined لو ما تم تمرير القائمة الحقيقية إطلاقًا (بدل الرجوع للمصفوفة المحلية الخاطئة الترتيب)', () => {
    expect(getGovernorateSelectValueFromApiCity({ id: 13, nameEn: 'Sweida' })).toBeUndefined()
  })

  it('يرجّع undefined لـ null (مافي محافظة محفوظة بعد)', () => {
    expect(getGovernorateSelectValueFromApiCity(null, REAL_GOVERNORATES)).toBeUndefined()
  })

  it('يرجّع النص كما هو لو وصل مسطّح أصلًا (توافق مع شكل mock القديم)', () => {
    expect(getGovernorateSelectValueFromApiCity('Damascus', REAL_GOVERNORATES)).toBe('Damascus')
  })
})

// القيمة المُرسلة فعليًا لمحافظة "ريف دمشق" لازم تكون "Rif Dimashq" حصرًا —
// البيانات الخام بالمصفوفة بتخزّنها كـ nameEn: "Rural Damascus"،
// وgetGovernorateSelectValue هي المسؤولة الوحيدة عن التحويل (راجع تعليقها بالملف الأصلي)
describe('getGovernorateSelectValue', () => {
  it('يحوّل "Rural Damascus" إلى "Rif Dimashq" بالضبط', () => {
    expect(getGovernorateSelectValue('Rural Damascus')).toBe('Rif Dimashq')
  })

  it('يرجّع nameEn كما هو لباقي المحافظات (لا تحويل)', () => {
    expect(getGovernorateSelectValue('Damascus')).toBe('Damascus')
    expect(getGovernorateSelectValue('Aleppo')).toBe('Aleppo')
  })
})

describe('getGovernorateBySelectValue', () => {
  it('يجد محافظة "ريف دمشق" عبر القيمة المُرسلة "Rif Dimashq" بالقائمة المحلية (nameEn: "Rural Damascus" + الاشتقاق)، وليس عبر nameEn الخام', () => {
    const governorate = getGovernorateBySelectValue('Rif Dimashq', syrianGovernorates)

    expect(governorate).toBeDefined()
    expect(governorate.nameEn).toBe('Rural Damascus')
  })

  it('لا يجد أي محافظة بقيمة "Rural Damascus" — هاي القيمة الخام مش قيمة اختيار صالحة أبدًا', () => {
    expect(getGovernorateBySelectValue('Rural Damascus', syrianGovernorates)).toBeUndefined()
  })

  it('(CRIT-3) يجد محافظة "Sweida" بالقائمة الحقيقية الممرَّرة عبر id=13 — لا علاقة له بترتيب المصفوفة المحلية', () => {
    const governorate = getGovernorateBySelectValue('Sweida', REAL_GOVERNORATES)

    expect(governorate).toBeDefined()
    expect(governorate.id).toBe(13)
  })

  it('يرجّع undefined لو ما تم تمرير أي قائمة (بدل البحث الداخلي بالمصفوفة المحلية الخاطئة الترتيب)', () => {
    expect(getGovernorateBySelectValue('Rif Dimashq')).toBeUndefined()
  })
})

describe('اتساق القائمة الكاملة مع قاعدة "Rif Dimashq"', () => {
  it('لا تحتوي المصفوفة الخام على "Rif Dimashq" كـ nameEn مباشرة — القيمة محسوبة فقط عبر getGovernorateSelectValue', () => {
    const rawNames = syrianGovernorates.map((governorate) => governorate.nameEn)
    expect(rawNames).toContain('Rural Damascus')
    expect(rawNames).not.toContain('Rif Dimashq')
  })

  it('لا تُنتج قيمة الاختيار المحسوبة لأي محافظة النص "Rural Damascus" إطلاقًا', () => {
    const selectValues = syrianGovernorates.map((governorate) => getGovernorateSelectValue(governorate.nameEn))
    expect(selectValues).not.toContain('Rural Damascus')
    expect(selectValues).toContain('Rif Dimashq')
  })
})

describe('getGovernorateByNameEn و getActiveGovernorates', () => {
  it('getGovernorateByNameEn بيبحث بـ nameEn الخام ("Rural Damascus")، مش بقيمة الاختيار', () => {
    expect(getGovernorateByNameEn('Rural Damascus')?.nameAr).toBe('ريف دمشق')
    expect(getGovernorateByNameEn('Rif Dimashq')).toBeUndefined()
  })

  it('getActiveGovernorates بترجع بس المحافظات المفعّلة (isActive !== false)', () => {
    const active = getActiveGovernorates()
    expect(active.every((governorate) => governorate.isActive !== false)).toBe(true)
    expect(active.length).toBeLessThanOrEqual(syrianGovernorates.length)
  })
})

describe('إدارة المحافظات (أدمن) — تطابق المسار والحقول مع GovernorateController/GovernorateRequest الحقيقيين', () => {
  beforeEach(() => {
    apiClient.post.mockReset()
    apiClient.put.mockReset()
    apiClient.patch.mockReset()
    apiClient.post.mockResolvedValue({ data: {} })
    apiClient.put.mockResolvedValue({ data: {} })
    apiClient.patch.mockResolvedValue({ data: {} })
  })

  it('createGovernorate يرسل name_en فقط (name_ar انحذف من الفورم، اختياري بالباك اند)', async () => {
    await createGovernorate({ nameEn: 'Test City' })

    expect(apiClient.post).toHaveBeenCalledWith('/admin/governorates', {
      name_en: 'Test City',
    })
  })

  it('toggleGovernorateStatus يرسل لـ /admin/governorates/{id}/status مع isActive كما هو', async () => {
    await toggleGovernorateStatus(15, false)

    expect(apiClient.patch).toHaveBeenCalledWith('/admin/governorates/15/status', { isActive: false })
  })
})
