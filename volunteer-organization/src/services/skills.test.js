import { describe, it, expect, vi, beforeEach } from 'vitest'

// نجبر create/update/deleteSkill على مسار الـ API الحقيقي — نفس نمط
// organization.test.js بالضبط
vi.mock('./api/mockMode', () => ({ isMockMode: () => false }))
vi.mock('./api/client', () => ({
  apiClient: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  getApiErrorMessage: (_error, fallback) => fallback,
}))

import { apiClient } from './api/client'
import { createSkill, updateSkill, deleteSkill } from './skills'

describe('إدارة المهارات (أدمن) — تطابق المسار والحقول مع SkillController/SkillRequest الحقيقيين', () => {
  beforeEach(() => {
    apiClient.post.mockReset()
    apiClient.put.mockReset()
    apiClient.delete.mockReset()
    apiClient.post.mockResolvedValue({ data: {} })
    apiClient.put.mockResolvedValue({ data: {} })
    apiClient.delete.mockResolvedValue({ data: {} })
  })

  it('createSkill يرسل لـ /admin/skills (مو /skills) مع category_id snake_case', async () => {
    await createSkill({ name: 'First Aid', categoryId: '2' })

    expect(apiClient.post).toHaveBeenCalledWith('/admin/skills', { name: 'First Aid', category_id: '2' })
  })

  it('updateSkill يرسل لـ /admin/skills/{id} مع category_id snake_case', async () => {
    await updateSkill('5', { name: 'First Aid', categoryId: '3' })

    expect(apiClient.put).toHaveBeenCalledWith('/admin/skills/5', { name: 'First Aid', category_id: '3' })
  })

  it('deleteSkill يرسل لـ /admin/skills/{id}', async () => {
    await deleteSkill('5')

    expect(apiClient.delete).toHaveBeenCalledWith('/admin/skills/5')
  })
})
