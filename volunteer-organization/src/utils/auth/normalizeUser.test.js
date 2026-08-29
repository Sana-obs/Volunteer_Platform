import { describe, it, expect } from 'vitest'
import { normalizeUser } from './normalizeUser'

// شكل استجابة UserResource.php الفعلي (POST /login بوضع real)، مأخوذ
// حرفيًا من اختبار يدوي مقابل الباك اند المحلي — راجع تعليق
// flattenVolunteerProfile بـ normalizeUser.js لسبب وجود هالتطبيع أصلًا
const REAL_LOGIN_USER = {
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
}

// شكل ردّ POST /login الفعلي (تأكيد حي 2026-08-27): UserResource بترجّع
// volunteer متداخل *مختصر* — بلا city ولا skills إطلاقًا (بس GET
// /volunteers/me بيرجّعهم). العلم has_volunteer_profile هو إشارة
// الاكتمال الموثوقة بهالحالة
const REAL_LOGIN_USER_NO_CITY_SKILLS = {
  id: 45,
  first_name: 'Live',
  last_name: 'Tester',
  email: 'live.tester@example.com',
  phone_number: '0999123456',
  roles: ['volunteer'],
  has_volunteer_profile: true,
  has_organization_profile: false,
  volunteer: {
    id: 33,
    gender: 'male',
    education_level: 'High School',
    birth_date: '2000-01-01',
    about: 'Live test about text',
    photo: null,
  },
  organization: null,
}

// نفس القائمة الحقيقية الراجعة فعليًا من GET /governorates (تأكيد حي) —
// راجع CRIT-3 بـ syrianGovernorates.js لسبب لزوم تمريرها صراحة الآن
const REAL_GOVERNORATES = [{ id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق', slug: 'rif-dimashq', isActive: true }]

describe('normalizeUser — تسطيح بروفايل المتطوع الحقيقي (user.volunteer المتداخل)', () => {
  it('يسطّح الحقول الأساسية على مستوى user مباشرة', () => {
    const user = normalizeUser(REAL_LOGIN_USER, REAL_GOVERNORATES)

    expect(user.educationLevel).toBe('High School')
    expect(user.dateOfBirth).toBe('2000-01-01')
    expect(user.gender).toBe('male')
    expect(user.about).toBe('updated about')
  })

  it('يحوّل city المتداخل ({id, nameEn}) لقيمة الاختيار المستخدمة بالفورم (id=2 -> "Rif Dimashq") عبر القائمة الحقيقية الممرَّرة', () => {
    const user = normalizeUser(REAL_LOGIN_USER, REAL_GOVERNORATES)
    expect(user.city).toBe('Rif Dimashq')
  })

  it('(CRIT-3) يرجّع city فاضي (undefined) لو ما تم تمرير القائمة الحقيقية إطلاقًا — بدل الرجوع للمصفوفة المحلية الخاطئة الترتيب', () => {
    const user = normalizeUser(REAL_LOGIN_USER)
    expect(user.city).toBeUndefined()
  })

  it('يخزّن أسماء المهارات بمفتاح skillNames (مش skillIds) لأنه الباك اند بيرجّعها كأسماء فقط', () => {
    const user = normalizeUser(REAL_LOGIN_USER, REAL_GOVERNORATES)
    expect(user.skillNames).toEqual(['Tutoring'])
    expect(user.skillIds).toBeUndefined()
  })

  it('ما بيلمس شكل وضع mock المسطّح أصلًا (بدون مفتاح volunteer)', () => {
    const mockUser = {
      email: 'mock@example.com',
      educationLevel: "Bachelor's Degree",
      dateOfBirth: '1999-01-01',
      gender: 'Female',
      city: 'Damascus',
      skillIds: ['1', '2'],
    }

    const user = normalizeUser(mockUser)

    expect(user.educationLevel).toBe("Bachelor's Degree")
    expect(user.city).toBe('Damascus')
    expect(user.skillIds).toEqual(['1', '2'])
    expect(user.skillNames).toBeUndefined()
  })

  it('يطبّع has_volunteer_profile لـ hasVolunteerProfile (إشارة اكتمال البروفايل من ردّ /login)', () => {
    const user = normalizeUser(REAL_LOGIN_USER_NO_CITY_SKILLS, REAL_GOVERNORATES)
    expect(user.hasVolunteerProfile).toBe(true)
  })

  it('بوضع mock (بلا has_volunteer_profile) بتضل hasVolunteerProfile undefined فيرجع الفحص للحقول', () => {
    const user = normalizeUser({ email: 'mock@example.com', educationLevel: 'X' })
    expect(user.hasVolunteerProfile).toBeUndefined()
  })

  it('بتحافظ على hasVolunteerProfile بعد إعادة تطبيع نتيجة دمج patch جزئي بلا العلم', () => {
    const first = normalizeUser(REAL_LOGIN_USER_NO_CITY_SKILLS, REAL_GOVERNORATES)
    const merged = normalizeUser({ ...first, city: 'Damascus' })
    expect(merged.hasVolunteerProfile).toBe(true)
  })

  it('بعد دمج تعديل جزئي (updateUser الفعلي بـ AuthContext)، الحقول الطازجة بتغلب على volunteer القديم المتداخل', () => {
    // نفس ما يصير فعليًا بـ AuthContext.updateUser:
    // normalizeUser({ ...current.user, ...patch })
    const alreadyNormalized = normalizeUser(REAL_LOGIN_USER)

    const patch = {
      educationLevel: "Bachelor's Degree", // المستخدم غيّرها بالفورم
      city: 'Damascus', // وغيّر المحافظة كمان
      skillIds: ['13'], // وبدّل مهاراته لـ IDs فعلية بعد الحفظ
    }

    const merged = normalizeUser({ ...alreadyNormalized, ...patch })

    // القيم الطازجة (بعد التعديل) هي الفايزة، مش القديمة المتداخلة جوا volunteer
    expect(merged.educationLevel).toBe("Bachelor's Degree")
    expect(merged.city).toBe('Damascus')
    expect(merged.skillIds).toEqual(['13'])
  })
})

// شكل ردّ POST /login لحساب منظمة (UserResource): organization متداخل
// (زي volunteer بالضبط)، بلا أي orgName مسطّح — نفس ما بيوصل فعليًا
const REAL_ORG_LOGIN_USER = {
  id: 7,
  first_name: null,
  last_name: null,
  email: 'contact@greencoast.org',
  phone_number: '0988888888',
  roles: ['organization'],
  has_organization_profile: true,
  volunteer: null,
  organization: {
    id: 4,
    name: 'Green Coast Initiative',
    description: 'Coastal cleanup',
    status: 'verified',
  },
}

describe('normalizeUser — تسطيح اسم المنظمة المتداخل (user.organization)', () => {
  it('يسطّح organization.name المتداخل لـ orgName على مستوى user مباشرة', () => {
    const user = normalizeUser(REAL_ORG_LOGIN_USER, REAL_GOVERNORATES)
    expect(user.orgName).toBe('Green Coast Initiative')
  })

  it('displayName بيصير اسم المنظمة (مش الإيميل) لحساب منظمة حقيقي', () => {
    const user = normalizeUser(REAL_ORG_LOGIN_USER, REAL_GOVERNORATES)
    expect(user.displayName).toBe('Green Coast Initiative')
  })

  it('ما بيلمس حساب منظمة بوضع mock (orgName مسطّح أصلًا، بلا مفتاح organization)', () => {
    const mockOrg = { email: 'mock@org.com', orgName: 'My Mock Org', accountType: 'organization' }
    const user = normalizeUser(mockOrg)
    expect(user.orgName).toBe('My Mock Org')
    expect(user.displayName).toBe('My Mock Org')
  })

  it('orgName المسطّح الطازج (لو وصل بـ patch) بيغلب على organization.name المتداخل القديم', () => {
    const alreadyNormalized = normalizeUser(REAL_ORG_LOGIN_USER, REAL_GOVERNORATES)
    const merged = normalizeUser({ ...alreadyNormalized, orgName: 'Renamed Org' })
    expect(merged.orgName).toBe('Renamed Org')
  })

  it('متطوع (organization=null) ما بيتأثر — بلا orgName', () => {
    const user = normalizeUser(REAL_LOGIN_USER, REAL_GOVERNORATES)
    expect(user.orgName).toBeUndefined()
  })
})
