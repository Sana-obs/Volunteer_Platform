import { describe, it, expect, vi, beforeEach } from 'vitest'

// نجبر fetchRecentNotifications على مسار الـ API الحقيقي (غير mock) —
// هو المسار الوحيد اللي فيه الفلترة الدفاعية `data.filter((item) => !item.seen)`
// المطلوب اختبارها (راجع تعليق الفلترة الدفاعية بأعلى services/notifications.js)
vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}))

import { apiClient } from './api/client'
import { fetchRecentNotifications } from './notifications'
import { ACCOUNT_TYPES } from '../constants/auth/accountTypes'

describe('fetchRecentNotifications — الفلترة الدفاعية بوضع API الحقيقي', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('يستبعد أي عنصر seen: true حتى لو الباك اند تجاهل ?unread=true ورجّع كل الإشعارات', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        { id: 1, title: 'Unread one', seen: false },
        { id: 2, title: 'Already read', seen: true },
      ],
    })

    const items = await fetchRecentNotifications()

    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(1)
  })

  it('يرجّع مصفوفة فاضية لما تكون كل الإشعارات القادمة من الباك اند مقروءة أصلًا', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1, seen: true }] })

    const items = await fetchRecentNotifications()

    expect(items).toEqual([])
  })

  it('يرجّع مصفوفة فاضية لو الباك اند رجّع شكل غير متوقع (مش Array)', async () => {
    apiClient.get.mockResolvedValue({ data: null })

    const items = await fetchRecentNotifications()

    expect(items).toEqual([])
  })

  it('يستخدم قيمًا افتراضية آمنة لما تكون حقول العنصر (type/title/description/href) غير موجودة', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 3, seen: false }] })

    const items = await fetchRecentNotifications()

    expect(items[0]).toMatchObject({
      type: 'update',
      title: 'New update',
      description: '',
    })
  })
})

describe('fetchRecentNotifications — حساب منظمة بوضع real', () => {
  beforeEach(() => {
    apiClient.get.mockReset()
  })

  it('يستخدم GET /notifications الحقيقي مباشرة (نفس مسار المتطوع)، مش اشتقاق يدوي من fetchOrganizationProfile', async () => {
    apiClient.get.mockResolvedValue({
      data: [{ id: 9, type: 'org-verified', title: 'Organization verified successfully', seen: false }],
    })

    const items = await fetchRecentNotifications({ accountType: ACCOUNT_TYPES.ORGANIZATION, organizationId: 1 })

    expect(apiClient.get).toHaveBeenCalledWith('/notifications', { params: { unread: true } })
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('org-verified')
  })

  it('يرجّع مصفوفة فاضية بدون أي استدعاء API لو organizationId غير موجود', async () => {
    const items = await fetchRecentNotifications({ accountType: ACCOUNT_TYPES.ORGANIZATION, organizationId: null })

    expect(items).toEqual([])
    expect(apiClient.get).not.toHaveBeenCalled()
  })
})
