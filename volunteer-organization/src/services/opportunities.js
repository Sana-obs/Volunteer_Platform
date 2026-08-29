import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { OPPORTUNITY_STATUS } from '../constants/opportunityStatus'
import { getEffectiveOpportunityStatus, isSuccessfulOpportunity } from '../utils/opportunityStatus'
import { fetchAvailableSkills } from './skills'
import { loadMockUsers } from './mock/mockUserStore'
import { addMockParticipation, MOCK_PARTICIPATIONS } from './mock/mockParticipationsStore'
import { MOCK_OPPORTUNITIES, MOCK_MY_ORGANIZATION_ID } from './mock/mockOpportunitiesStore'
import {
  getGovernorateBySelectValue,
  getGovernorateSelectValue,
  getGovernorateSelectValueFromApiCity,
} from './syrianGovernorates'
import { AUTH_STORAGE_KEY } from '../constants/auth/storage'
import { normalizeOpportunityOrganization } from '../utils/api/apiResponseSchemas'
import { PARTICIPATION_STATUS } from '../constants/participationStatus'

function getCurrentSessionEmail() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)?.user?.email || null
  } catch {
    return null
  }
}

const MOCK_MODE = isMockMode()

function computeLiveCurrentVolunteers(opportunityId) {
  return MOCK_PARTICIPATIONS.filter(
    (participation) =>
      participation.opportunityId === opportunityId &&
      participation.status === PARTICIPATION_STATUS.ACCEPTED,
  ).length
}


function attachComputedStatus(opportunity) {
  if (!opportunity) return opportunity
  const withLiveCount = {
    ...opportunity,
    currentVolunteers: computeLiveCurrentVolunteers(opportunity.id),
  }

  return { ...withLiveCount, status: getEffectiveOpportunityStatus(withLiveCount) }
}
export function mapApiOpportunity(raw, governorates = []) {
  if (!raw) return null

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    location: getGovernorateSelectValueFromApiCity(raw.city, governorates) || '',
    startDate: raw.start_date,
    endDate: raw.end_date,
    registerStartAt: raw.register_start_at,
    registerEndAt: raw.register_end_at,
    minHours: raw.min_hours,
    maxHours: raw.max_hours,
    totalHours: raw.total_hours,
    currentVolunteers: raw.current_volunteers,
    maxVolunteers: raw.max_volunteers,
    minVolunteers: raw.min_volunteers,
    registrationClosedManually: raw.registration_closed_manually,
    registrationClosedReason: raw.registrationClosedReason ?? null,
    status: raw.status,
    category: raw.category || null,
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    organization: normalizeOpportunityOrganization(raw.organization),
    image: raw.image ?? null,
    isGroup: raw.is_group ?? false,
    isSuitable: raw.isSuitable,
    matchLabel: raw.matchLabel,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  }
}

function buildOpportunityFormData(payload, imageFile, governorates = []) {
  const formData = new FormData()

  const categoryId = payload.categoryId ?? payload.category?.id
  const governorate = getGovernorateBySelectValue(payload.location ?? payload.city, governorates)
  const skillIds = Array.isArray(payload.skills)
    ? payload.skills.map((skill) => (typeof skill === 'object' ? skill?.id : skill)).filter(Boolean)
    : []

  formData.append('title', payload.title || '')
  formData.append('description', payload.description || '')
  if (categoryId != null) formData.append('category_id', categoryId)
  if (governorate) formData.append('governorate_id', governorate.id)
  skillIds.forEach((skillId) => formData.append('skills[]', skillId))

  if (payload.startDate) formData.append('start_date', payload.startDate)
  if (payload.endDate) formData.append('end_date', payload.endDate)
  if (payload.registerStartAt) formData.append('register_start_at', payload.registerStartAt)
  if (payload.registerEndAt) formData.append('register_end_at', payload.registerEndAt)

  if (payload.minHours != null) formData.append('min_hours', payload.minHours)
  if (payload.maxHours != null) formData.append('max_hours', payload.maxHours)
  if (payload.totalHours != null) formData.append('total_hours', payload.totalHours)
  if (payload.minVolunteers != null) formData.append('min_volunteers', payload.minVolunteers)
  if (payload.maxVolunteers != null) formData.append('max_volunteers', payload.maxVolunteers)

  if (payload.isGroup) formData.append('is_group', '1')

  if (imageFile) formData.append('image', imageFile)

  return formData
}

export function matchesFilters(opportunity, filters = {}) {
  const {
    search = '',
    categoryId = '',
    categoryIds = [],
    skillId = '',
    skillIds = [],
    location = '',
  } = filters

  const normalizedOpportunity = opportunity || {}
  const opportunityTitle = normalizedOpportunity.title || ''
  const opportunityLocation = normalizedOpportunity.location || ''
  const opportunityCategoryId = normalizedOpportunity.category?.id || ''
  const opportunitySkills = Array.isArray(normalizedOpportunity.skills)
    ? normalizedOpportunity.skills
    : []
  const normalizedCategoryIds = Array.isArray(categoryIds) ? categoryIds.filter(Boolean) : []
  const normalizedSkillIds = Array.isArray(skillIds) ? skillIds.filter(Boolean) : []

  const matchesSearch =
    !search || opportunityTitle.toLowerCase().includes(search.trim().toLowerCase())

  const matchesCategory =
    (!categoryId && normalizedCategoryIds.length === 0) ||
    opportunityCategoryId === categoryId ||
    normalizedCategoryIds.includes(opportunityCategoryId)

  const matchesSkill =
    (!skillId && normalizedSkillIds.length === 0) ||
    opportunitySkills.some((skill) => skill.id === skillId || normalizedSkillIds.includes(skill.id))

  const matchesLocation =
    !location || opportunityLocation.toLowerCase().includes(location.trim().toLowerCase())

  return matchesSearch && matchesCategory && matchesSkill && matchesLocation
}

/**
 * يحسب نقاط تطابق فرصة معيّنة مع متطوع معيّن، وبيرجّع كمان أقوى سبب
 * تطابق كجملة مبسّطة (مش رقم خام) — نفس أسلوب LinkedIn/Netflix: سبب
 * واحد بس، الأقوى، مش قائمة كل الأسباب مع بعض (بيصير مزدحم بصريًا).
 * @param {object} opportunity
 * @param {{skillIds: string[], skillNames: Map<string,string>, city: string}} params
 * @returns {{score: number, reason: string|null}}
 */
function computeMatchScore(opportunity, { skillIds, skillNames, city }) {
  const reasons = []

  const opportunitySkills = Array.isArray(opportunity.skills) ? opportunity.skills : []
  const matchingSkillsCount = opportunitySkills.filter((skill) => skillIds.includes(skill.id)).length
  const matchingSkill = opportunitySkills.find((skill) => skillIds.includes(skill.id))
  if (matchingSkill) {
    reasons.push({
      weight: matchingSkillsCount * 3,
      text: `Matches your ${skillNames.get(matchingSkill.id) || matchingSkill.name} skill`,
    })
  }

  const isSameCity = Boolean(
    city && opportunity.location?.toLowerCase().includes(city.trim().toLowerCase()),
  )
  if (isSameCity) {
    reasons.push({ weight: 2, text: 'Near your city' })
  }

  const score = matchingSkillsCount * 3 + (isSameCity ? 2 : 0)

  reasons.sort((a, b) => b.weight - a.weight)
  return { score, reason: reasons[0]?.text || null }
}


export async function fetchCompletedOpportunities(governorates = []) {
  if (MOCK_MODE) {
    await wait()
    return MOCK_OPPORTUNITIES.map(attachComputedStatus).filter((opportunity) => isSuccessfulOpportunity(opportunity))
  }

  try {
    const response = await apiClient.get('/opportunities', {
      params: { status: OPPORTUNITY_STATUS.COMPLETED },
    })
    const data = Array.isArray(response.data) ? response.data : []

    return data
      .map((raw) => mapApiOpportunity(raw, governorates))
      .filter((opportunity) => isSuccessfulOpportunity(opportunity))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load completed opportunities'), { cause: error })
  }
}

/**
 * Fetches opportunities, optionally filtered.
 * @param {{search?:string, categoryId?:string, skillId?:string, location?:string}} filters
 */
export async function fetchOpportunities(filters = {}, governorates = []) {
  if (MOCK_MODE) {
    await wait()

    return MOCK_OPPORTUNITIES.filter((opportunity) => matchesFilters(opportunity, filters))
      .map(attachComputedStatus)
      .sort((a, b) => new Date(a.registerEndAt) - new Date(b.registerEndAt))
  }

  try {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value != null),
    )
    const response = await apiClient.get('/opportunities', { params })
    const data = Array.isArray(response.data) ? response.data : []
    return data.map((raw) => mapApiOpportunity(raw, governorates))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load opportunities'), { cause: error })
  }
}

/**
 * @param {{skillIds?: string[], city?: string}} volunteer
 */
export async function fetchSuggestedOpportunities({ skillIds = [], city = '' } = {}, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    // لبناء جملة "Matches your X skill" محتاجين اسم المهارة، مش بس ID
    const allSkills = await fetchAvailableSkills()
    const skillNames = new Map(allSkills.map((skill) => [skill.id, skill.name]))

    return MOCK_OPPORTUNITIES.map((opportunity) => ({
      opportunity,
      ...computeMatchScore(opportunity, { skillIds, skillNames, city }),
    }))
      // بس الفرص يلي إلها تطابق حقيقي (نقاط > 0) — مش أي فرصة بالمنصة.
      // نقطة أدنى منطقية بدل عرض كل شي مرتّب بس بدون أي حد أدنى للصلة
      .filter(({ score }) => score > 0)
      // من الأعلى تطابقًا للأقل — عكس الفلترة الثنائية القديمة يلي كانت
      // تُظهر أو تُخفي الفرصة بالكامل بدون أي تدرّج بينهم
      .sort((a, b) => b.score - a.score)
      .map(({ opportunity, reason }) => ({ ...attachComputedStatus(opportunity), matchReason: reason }))
  }

  try {
    const response = await apiClient.get('/volunteers/me/suggested-opportunities')
    const data = Array.isArray(response.data) ? response.data : []

    return data
      .filter((item) => item.isSuitable)
      .map((item) => ({
        ...mapApiOpportunity(item, governorates),
        matchReason: 'Matches your skills and location',
      }))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load suggested opportunities'), { cause: error })
  }
}

/**
 * Fetches a single opportunity by id, along with a short list of similar
 * opportunities (same category, excluding itself) for the details sidebar.
 */
export async function fetchOpportunityById(id, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    const opportunity = MOCK_OPPORTUNITIES.find((item) => item.id === id) || null
    const similar = opportunity
      ? MOCK_OPPORTUNITIES.filter(
          (item) => item.id !== id && item.category?.id === opportunity.category?.id,
        ).slice(0, 3)
      : []

    return {
      opportunity: attachComputedStatus(opportunity),
      similar: similar.map(attachComputedStatus),
    }
  }

  try {
      const response = await apiClient.get(`/opportunities/${id}`)
    const opportunity = mapApiOpportunity(response.data, governorates)

    let similar = []
    if (opportunity?.category?.id) {
      try {
        const sameCategory = await fetchOpportunities({ categoryId: opportunity.category.id }, governorates)
        similar = sameCategory.filter((item) => item.id !== opportunity.id).slice(0, 3)
      } catch {
        similar = []
      }
    }

    return { opportunity, similar }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load opportunity details'), { cause: error })
  }
}

/**

 * @param {string|number} organizationId
 */
export async function fetchMyOpportunities(organizationId, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    return MOCK_OPPORTUNITIES.filter(
      (opportunity) => opportunity.organization?.id === MOCK_MY_ORGANIZATION_ID,
    ).map(attachComputedStatus)
  }

  const all = await fetchOpportunities({}, governorates)
  return all.filter((opportunity) => String(opportunity.organization?.id) === String(organizationId))
}

/**
 * @param {string} organizationId
 */
export async function fetchOpportunitiesByOrganization(organizationId, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    return MOCK_OPPORTUNITIES.map(attachComputedStatus).filter(
      (opportunity) => opportunity.organization?.id === organizationId,
    )
  }

  const all = await fetchOpportunities({}, governorates)
  return all.filter((opportunity) => String(opportunity.organization?.id) === String(organizationId))
}


export async function deleteOpportunity(id) {
  if (MOCK_MODE) {
    await wait()

    const index = MOCK_OPPORTUNITIES.findIndex((item) => item.id === id)
    if (index !== -1) MOCK_OPPORTUNITIES.splice(index, 1)
    return { success: true }
  }

  try {
    await apiClient.delete(`/opportunities/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to delete this cause') }
  }
}

export async function createOpportunity({ imageFile, ...payload }, governorates = []) {
  
  const selectedCityValue = payload.location ?? payload.city
  const selectedGovernorate = selectedCityValue ? getGovernorateBySelectValue(selectedCityValue, governorates) : null
  if (selectedGovernorate && selectedGovernorate.isActive === false) {
    return { success: false, error: 'This governorate is no longer served by the platform.' }
  }

  if (MOCK_MODE) {
    await wait()

    const email = getCurrentSessionEmail()
    const mockUser = email ? loadMockUsers().find((user) => user.email === email) : null

    const newOpportunity = {
      ...payload,
      id: `o${Date.now()}`,
      createdAt: new Date().toISOString(),
      registrationClosedManually: false,
      registrationClosedReason: null,
      currentVolunteers: 0,
      organization: {
        id: MOCK_MY_ORGANIZATION_ID,
        name: mockUser?.orgName || 'My Organization',
        phone: mockUser?.phone || '+31600000000',
        imageUrl: mockUser?.imageUrl || null,
      },
      image: imageFile ? URL.createObjectURL(imageFile) : null,
    }
    // تُضاف مباشرة لنفس المصدر الموحّد، فتظهر فورًا بصفحة التصفح العامة
    // للمتطوعين تمامًا كما ستظهر بـ "My Causes" — بلا أي فرق بينهما
    MOCK_OPPORTUNITIES.unshift(newOpportunity)
    return { success: true, data: attachComputedStatus(newOpportunity) }
  }

  try {
    const formData = buildOpportunityFormData(payload, imageFile, governorates)
    const response = await apiClient.post('/opportunities', formData)
    return { success: true, data: mapApiOpportunity(response.data, governorates) }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to create this cause') }
  }
}

/**
 * يعدّل فرصة موجودة (من طرف المنظمة).
 */
export async function updateOpportunity(id, { imageFile, ...payload }, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    const index = MOCK_OPPORTUNITIES.findIndex((item) => item.id === id)
    if (index !== -1) {
    
      MOCK_OPPORTUNITIES[index] = {
        ...MOCK_OPPORTUNITIES[index],
        ...payload,
        image: imageFile ? URL.createObjectURL(imageFile) : MOCK_OPPORTUNITIES[index].image,
      }
    }
    return { success: true, data: attachComputedStatus(MOCK_OPPORTUNITIES[index]) }
  }

  try {
    
    const formData = buildOpportunityFormData(payload, imageFile, governorates)
    const response = await apiClient.post(`/opportunities/${id}`, formData)
    return { success: true, data: mapApiOpportunity(response.data, governorates) }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to update this cause') }
  }
}

/**
 * Registers the current volunteer's participation in an opportunity.
 * Maps to the "participates" relation (volunteer <-> opportunity).
 * @param {string} id
 * @param {number} committedHours - عدد الساعات يلي حدّده المتطوع بنفسه
 *   وقت التسجيل، لازم يكون جوا نطاق [minHours, maxHours] تبع هاي الفرصة
 */
export async function participateInOpportunity(id, committedHours) {
  if (MOCK_MODE) {
    await wait()

    const opportunity = MOCK_OPPORTUNITIES.find((item) => item.id === id)
    if (!opportunity) return { success: false, error: 'Opportunity not found' }

    const liveOpportunity = { ...opportunity, currentVolunteers: computeLiveCurrentVolunteers(opportunity.id) }
    if (getEffectiveOpportunityStatus(liveOpportunity) !== OPPORTUNITY_STATUS.REGISTRATION_OPEN) {
      return { success: false, error: 'Registration is no longer open for this opportunity' }
    }

    // تحقق من عدد الساعات — لازم يكون *جوا* نطاق الفرصة بالكامل
    // [minHours, maxHours]، مش بس أكبر من الحد الأدنى. نفس القاعدة
    // لازم تتأكد بالباك اند الحقيقي كمان (الفرونت خط دفاع أول بس)
    const hours = Number(committedHours)
    if (!Number.isFinite(hours) || hours < opportunity.minHours || hours > opportunity.maxHours) {
      return {
        success: false,
        error: `Please commit to a number between ${opportunity.minHours} and ${opportunity.maxHours} hours.`,
      }
    }

    const email = getCurrentSessionEmail()
    const mockUser = email ? loadMockUsers().find((user) => user.email === email) : null

    if (email) {
      const hasActiveParticipation = MOCK_PARTICIPATIONS.some(
        (participation) =>
          participation.opportunityId === id &&
          participation.volunteerProfile?.email === email &&
          participation.status !== PARTICIPATION_STATUS.WITHDRAWN &&
          participation.status !== PARTICIPATION_STATUS.REJECTED,
      )
      if (hasActiveParticipation) {
        return { success: false, error: 'You have already applied to this opportunity' }
      }
    }

    if (mockUser) {
      // skillIds مخزّنة بالبروفايل (مو أسماء) — لازم نحوّلها لأسماء
      // حقيقية قبل ما تنعرض ببطاقة المتقدم عند المنظمة
      const allSkills = await fetchAvailableSkills()
      const skillNames = (mockUser.skillIds || [])
        .map((skillId) => allSkills.find((skill) => skill.id === skillId)?.name)
        .filter(Boolean)

      addMockParticipation({
        opportunityId: id,
        committedHours: hours,
        volunteerProfile: {
          email,
          name: [mockUser.firstName, mockUser.lastName].filter(Boolean).join(' ') || 'A volunteer',
          photo: mockUser.imageUrl || null,
          city: mockUser.city || '',
          skills: skillNames,
          phone: mockUser.phone || '',
          educationLevel: mockUser.educationLevel || '',
          dateOfBirth: mockUser.dateOfBirth || null,
          gender: mockUser.gender || '',
        },
      })
    }

    return { success: true }
  }

  try {
    await apiClient.post(`/opportunities/${id}/participate`, { committed_hours: committedHours })
    return { success: true }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to join opportunity') }
  }
}


export async function setOpportunityStatus(id, status, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    const index = MOCK_OPPORTUNITIES.findIndex((item) => item.id === id)
    if (index === -1) return { success: false, error: 'Opportunity not found' }

    const isClosing = status === OPPORTUNITY_STATUS.REGISTRATION_CLOSED
    MOCK_OPPORTUNITIES[index] = {
      ...MOCK_OPPORTUNITIES[index],
      registrationClosedManually: isClosing,
      registrationClosedReason: isClosing ? 'organization' : null,
    }
    return { success: true, data: attachComputedStatus(MOCK_OPPORTUNITIES[index]) }
  }

  try {
    const response = await apiClient.patch(`/opportunities/${id}/status`, { status })
    return { success: true, data: mapApiOpportunity(response.data, governorates) }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to update cause status') }
  }
}

/**
  * @param {string} cityNameEn - الاسم الإنجليزي الخام للمحافظة (nameEn)
 */
export function closeCityOpportunitiesRegistration(cityNameEn) {
  const cityValue = getGovernorateSelectValue(cityNameEn)

  MOCK_OPPORTUNITIES.forEach((opportunity) => {
    if (opportunity.location !== cityValue) return
    if (getEffectiveOpportunityStatus(opportunity) !== OPPORTUNITY_STATUS.REGISTRATION_OPEN) return

    opportunity.registrationClosedManually = true
    opportunity.registrationClosedReason = 'city_deactivated'
  })
}