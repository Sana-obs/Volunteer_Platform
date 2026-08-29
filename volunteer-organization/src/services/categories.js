
import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'

const MOCK_MODE = isMockMode()

const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Health', description: 'Health awareness, care, and support programs', opportunitiesCount: 6 },
  { id: 'c2', name: 'Education', description: 'Tutoring, mentoring, and literacy programs', opportunitiesCount: 8 },
  { id: 'c3', name: 'Social', description: 'Community support and social welfare', opportunitiesCount: 5 },
  { id: 'c4', name: 'Sport', description: 'Sports events and youth activities', opportunitiesCount: 3 },
  { id: 'c5', name: 'Environment', description: 'Environmental cleanup and conservation', opportunitiesCount: 4 },
  { id: 'c6', name: 'Technical', description: 'IT, design, and technical support projects', opportunitiesCount: 4 },
]

/**
 * Fetches all categories (shared across opportunities, skills, and achievements).
 * @returns {Promise<Array<{id:string, name:string, description:string, opportunitiesCount:number}>>}
 */
export async function fetchCategories() {
  if (MOCK_MODE) {
    await wait()
    return [...MOCK_CATEGORIES]
  }

  try {
    const response = await apiClient.get('/categories')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load categories'), { cause: error })
  }
}

/**
 * ينشئ تصنيفًا جديدًا. نفس نمط {success,data/error} المستخدم بباقي
 * عمليات التعديل (organization.js، participations.js) لأنه فشل واحد
 * (مثلًا اسم مكرر) ما لازم يكسر الصفحة، فقط يُعرض كرسالة خطأ واضحة.
 * @param {{name: string, description: string}} payload
 */
export async function createCategory(payload) {
  if (MOCK_MODE) {
    await wait()

    const nameTaken = MOCK_CATEGORIES.some(
      (category) => category.name.trim().toLowerCase() === payload.name.trim().toLowerCase(),
    )
    if (nameTaken) return { success: false, error: 'A category with this name already exists' }

    const newCategory = {
      id: `c${Date.now()}`,
      name: payload.name,
      description: payload.description,
      opportunitiesCount: 0,
    }
    MOCK_CATEGORIES.push(newCategory)
    return { success: true, data: newCategory }
  }

  try {
    const response = await apiClient.post('/admin/categories', payload)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to create category') }
  }
}

/**
 * @param {string|number} categoryId
 * @param {{name: string, description: string}} payload
 */
export async function updateCategory(categoryId, payload) {
  if (MOCK_MODE) {
    await wait()

    const category = MOCK_CATEGORIES.find((item) => item.id === categoryId)
    if (!category) return { success: false, error: 'Category not found' }

    // نستثني التصنيف نفسه من فحص التكرار — نفس منطق updateSkill بالضبط
    const nameTaken = MOCK_CATEGORIES.some(
      (item) =>
        item.id !== categoryId && item.name.trim().toLowerCase() === payload.name.trim().toLowerCase(),
    )
    if (nameTaken) return { success: false, error: 'A category with this name already exists' }

    category.name = payload.name
    category.description = payload.description
    return { success: true, data: category }
  }

  try {
    const response = await apiClient.put(`/admin/categories/${categoryId}`, payload)
    return { success: true, data: response.data }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to update category') }
  }
}

/**
 * @param {string|number} categoryId
 */
export async function deleteCategory(categoryId) {
  if (MOCK_MODE) {
    await wait()

    const index = MOCK_CATEGORIES.findIndex((item) => item.id === categoryId)
    if (index === -1) return { success: false, error: 'Category not found' }

    MOCK_CATEGORIES.splice(index, 1)
    return { success: true }
  }

  try {
    await apiClient.delete(`/admin/categories/${categoryId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to delete category') }
  }
}