import { describe, it, expect } from 'vitest'
import { isVolunteerProfileComplete, isOrganizationProfileComplete } from './profileCompletion'

// بروفايل متطوع مكتمل بالكامل بالشكل المسطّح (وضع mock، أو بعد الحفظ)
const COMPLETE_FLAT_VOLUNTEER = {
  educationLevel: 'High School',
  dateOfBirth: '2000-01-01',
  gender: 'male',
  city: 'Damascus',
  skillIds: ['2', '13'],
}

describe('isVolunteerProfileComplete', () => {
  it('يعتبره مكتملًا عبر العلم has_volunteer_profile (hasVolunteerProfile=true) حتى لو city/skills غائبين', () => {
    // ⚠️ هاي بالضبط حالة ردّ /login الحقيقي: UserResource ما بترجّع
    // volunteer.city ولا volunteer.skills — الفحص الحقلي كان بيفشل دايمًا
    const loginUser = {
      educationLevel: 'High School',
      dateOfBirth: '2000-01-01',
      gender: 'male',
      hasVolunteerProfile: true,
      // لا city ولا skillIds ولا skillNames
    }
    expect(isVolunteerProfileComplete(loginUser)).toBe(true)
  })

  it('بوضع mock (بلا العلم) بيعتمد على الحقول المسطّحة كاملةً', () => {
    expect(isVolunteerProfileComplete(COMPLETE_FLAT_VOLUNTEER)).toBe(true)
  })

  it('بوضع mock: ناقص city => غير مكتمل', () => {
    expect(isVolunteerProfileComplete({ ...COMPLETE_FLAT_VOLUNTEER, city: '' })).toBe(false)
  })

  it('بوضع mock: ناقص المهارات => غير مكتمل', () => {
    expect(isVolunteerProfileComplete({ ...COMPLETE_FLAT_VOLUNTEER, skillIds: [] })).toBe(false)
  })

  it('يقبل skillNames (أسماء) بدل skillIds لفحص الاكتمال', () => {
    const user = { ...COMPLETE_FLAT_VOLUNTEER, skillIds: undefined, skillNames: ['Tutoring'] }
    expect(isVolunteerProfileComplete(user)).toBe(true)
  })

  it('hasVolunteerProfile=false لا يقصر الفحص — يرجع للحقول', () => {
    expect(isVolunteerProfileComplete({ ...COMPLETE_FLAT_VOLUNTEER, hasVolunteerProfile: false })).toBe(true)
    expect(isVolunteerProfileComplete({ hasVolunteerProfile: false })).toBe(false)
  })

  it('user فاضٍ => غير مكتمل', () => {
    expect(isVolunteerProfileComplete(null)).toBe(false)
    expect(isVolunteerProfileComplete(undefined)).toBe(false)
  })
})

describe('isOrganizationProfileComplete', () => {
  it('يتطلب description + city سويةً', () => {
    expect(isOrganizationProfileComplete({ description: 'We help', city: 'Aleppo' })).toBe(true)
    expect(isOrganizationProfileComplete({ description: 'We help', city: '' })).toBe(false)
    expect(isOrganizationProfileComplete({ description: '', city: 'Aleppo' })).toBe(false)
    expect(isOrganizationProfileComplete(null)).toBe(false)
  })
})
