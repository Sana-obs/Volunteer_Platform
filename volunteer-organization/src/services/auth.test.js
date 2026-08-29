import { describe, it, expect, vi, beforeEach } from 'vitest'

// نجبر loginUser على مسار الـ API الحقيقي — نفس نمط باقي ملفات
// *.test.js بالمشروع (notifications.test.js، organization.test.js)
vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { post: vi.fn(), put: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
  getApiFieldErrors: () => null,
}))

import { apiClient } from './api/client'
import { loginUser, updateAdminProfile, changeAdminPassword } from './auth'

describe('loginUser — تحديد accountType من role الأدمن الحقيقي (platform-admin)', () => {
  beforeEach(() => {
    apiClient.post.mockReset()
  })

  it('يحوّل role="platform-admin" (اسم الـ role الحقيقي بالباك اند) لـ accountType="admin" الداخلي', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        user: { id: 16, email: 'admin@volunteer.test', roles: ['platform-admin'], volunteer: null, organization: null },
        token: 'real-admin-token',
      },
    })

    const result = await loginUser({ email: 'admin@volunteer.test', password: 'Admin@123' })

    expect(result.success).toBe(true)
    expect(result.data.accountType).toBe('admin')
  })

  it('ما بيلمس منطق volunteer/organization العادي', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        user: { id: 3, email: 'org@example.com', roles: ['organization'], organization: { id: 1 } },
        token: 'org-token',
      },
    })

    const result = await loginUser({ email: 'org@example.com', password: 'x' })

    expect(result.data.accountType).toBe('organization')
  })

  it('يمرّر governorates لـ normalizeUser فيتحوّل volunteer.city المتداخل لقيمة الاختيار وقت بناء الجلسة', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        user: {
          id: 21,
          email: 'vol@example.com',
          roles: ['volunteer'],
          volunteer: { id: 9, city: { id: 2, nameEn: 'Rif Dimashq' }, gender: 'male' },
          organization: null,
        },
        token: 't',
      },
    })

    const governorates = [{ id: 2, nameEn: 'Rif Dimashq', nameAr: 'ريف دمشق' }]
    const result = await loginUser({ email: 'vol@example.com', password: 'x' }, governorates)

    expect(result.data.user.city).toBe('Rif Dimashq')
  })

  it('بدون تمرير governorates (استدعاء قديم) city بيرجع فاضي بدل قيمة خاطئة — سلوك غير منكسر', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        user: {
          id: 22,
          email: 'vol2@example.com',
          roles: ['volunteer'],
          volunteer: { id: 10, city: { id: 2, nameEn: 'Rif Dimashq' } },
          organization: null,
        },
        token: 't',
      },
    })

    const result = await loginUser({ email: 'vol2@example.com', password: 'x' })

    expect(result.data.user.city).toBeUndefined()
  })

  it('اسم المنظمة المتداخل بيوصل مسطّحًا لـ orgName/displayName بعد تسجيل دخول منظمة', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        user: {
          id: 23,
          email: 'contact@org.com',
          roles: ['organization'],
          organization: { id: 5, name: 'Green Coast Initiative' },
          volunteer: null,
        },
        token: 't',
      },
    })

    const result = await loginUser({ email: 'contact@org.com', password: 'x' })

    expect(result.data.user.orgName).toBe('Green Coast Initiative')
    expect(result.data.user.displayName).toBe('Green Coast Initiative')
  })

  it('لو كان روول المستخدم فيه admin وorganization سوا (نظريًا)، الأدمن بياخد الأولوية', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        user: { id: 1, email: 'both@example.com', roles: ['platform-admin', 'organization'] },
        token: 't',
      },
    })

    const result = await loginUser({ email: 'both@example.com', password: 'x' })

    expect(result.data.accountType).toBe('admin')
  })
})

describe('updateAdminProfile — تطابق الحقول مع UpdateAdminProfileRequest الحقيقي', () => {
  beforeEach(() => {
    apiClient.put.mockReset()
    apiClient.put.mockResolvedValue({ data: { id: 16, first_name: 'Test', last_name: 'Admin' } })
  })

  it('يقسّم name (حقل مجمّع بالفورم) لـ first_name/last_name، ويرسل phone_number مش phone', async () => {
    await updateAdminProfile({ name: 'Test Admin', email: 'admin@volunteer.test', phone: '0900000000' })

    expect(apiClient.put).toHaveBeenCalledWith('/admin/profile', {
      first_name: 'Test',
      last_name: 'Admin',
      email: 'admin@volunteer.test',
      phone_number: '0900000000',
    })
  })
})

describe('changeAdminPassword — يضيف newPassword_confirmation المطلوبة لقاعدة confirmed', () => {
  beforeEach(() => {
    apiClient.put.mockReset()
    apiClient.put.mockResolvedValue({ data: null })
  })

  it('يرسل newPassword_confirmation بنفس قيمة newPassword — بدونها كل تغيير كلمة مرور كان يفشل بخطأ confirmed', async () => {
    await changeAdminPassword({ currentPassword: 'old', newPassword: 'NewPass123' })

    expect(apiClient.put).toHaveBeenCalledWith('/admin/password', {
      currentPassword: 'old',
      newPassword: 'NewPass123',
      newPassword_confirmation: 'NewPass123',
    })
  })
})
