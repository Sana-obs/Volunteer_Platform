import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { ACCOUNT_TYPES } from '../constants/auth/accountTypes'
import { ORGANIZATION_STATUS } from '../constants/organizationStatus'
import { OPPORTUNITY_STATUS } from '../constants/opportunityStatus'
import { loadMockUsers, updateMockUser } from './mock/mockUserStore'
import { MOCK_OPPORTUNITIES } from './mock/mockOpportunitiesStore'
import { getEffectiveOpportunityStatus } from '../utils/opportunityStatus'
import { getGovernorateSelectValueFromApiCity } from './syrianGovernorates'
import { extractPhotoUrl } from '../utils/extractPhotoUrl'

const MOCK_MODE = isMockMode()
const ADMIN_LIST_MAX_PAGES = 50

async function fetchAllAdminPages(path, params = {}) {
  const first = await apiClient.get(path, { params: { ...params, page: 1 } })

  const pageList = (response) =>
    Array.isArray(response.data) ? response.data : response.data?.data || []
  const pageMeta = (response) =>
    response.meta ?? (Array.isArray(response.data) ? undefined : response.data?.meta)

  const meta = pageMeta(first)
  const lastPage = Number(meta?.lastPage ?? meta?.last_page ?? 1)

  if (!Number.isFinite(lastPage) || lastPage <= 1) return pageList(first)

  const upTo = Math.min(lastPage, ADMIN_LIST_MAX_PAGES)
  const rest = await Promise.all(
    Array.from({ length: upTo - 1 }, (_, index) =>
      apiClient.get(path, { params: { ...params, page: index + 2 } }),
    ),
  )

  return [pageList(first), ...rest.map(pageList)].flat()
}

function daysFromNow(offset) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString()
}

function toOrganizationSummary(mockUser) {
  return {
    id: mockUser.organizationId,
    name: mockUser.orgName || '',
    email: mockUser.email || '',
    contactPerson: mockUser.contactPerson || '',
    phone: mockUser.phone || '',
    city: mockUser.city || '',
    website: mockUser.website || '',
    imageUrl: mockUser.imageUrl || null,
    verificationDocumentUrl: mockUser.verificationDocumentUrl || null,
    status: mockUser.status || ORGANIZATION_STATUS.PENDING,
    requestedAt: mockUser.createdAt || null,
    rejectionReason: mockUser.rejectionReason || '',
    reviewedAt: mockUser.reviewedAt || null,
  }
}

function mapApiOrganization(raw, governorates = []) {
  if (!raw) return null

  return {
    id: raw.id,
    name: raw.name || raw.org_name || '',
    email: raw.email || raw.owner?.email || '',
    contactPerson: raw.contact_person || raw.contactPerson || '',
    phone: raw.phone || raw.phone_number || '',
    city: getGovernorateSelectValueFromApiCity(raw.city, governorates) || '',
    website: raw.website || '',
    imageUrl: raw.image_url || raw.profile_image || raw.avatar_url || null,
    verificationDocumentUrl: raw.verification_document ||raw.verification_document_url || raw.verificationDocumentUrl || null,
    status: raw.status || ORGANIZATION_STATUS.PENDING,
    requestedAt: raw.requestedAt || raw.created_at || raw.createdAt || raw.requested_at || null,
    rejectionReason: raw.rejection_reason || raw.rejectionReason || '',
    reviewedAt: raw.reviewed_at || raw.reviewedAt || null,
  }
}

async function fetchAdminOrganizationList({ status } = {}, governorates = []) {
  if (MOCK_MODE) {
    await wait()

    return loadMockUsers()
      .filter((user) => user.accountType === ACCOUNT_TYPES.ORGANIZATION)
      .filter((user) => !status || (user.status || ORGANIZATION_STATUS.PENDING) === status)
      .map(toOrganizationSummary)
  }

  try {
    const list = await fetchAllAdminPages('/admin/organizations', status ? { status } : {})
    const organizations = list.map((raw) => mapApiOrganization(raw, governorates))

    return status ? organizations.filter((organization) => organization.status === status) : organizations
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load admin organizations'), { cause: error })
  }
}

export async function fetchAdminOrganizations(governorates = []) {
  return fetchAdminOrganizationList({}, governorates)
}

/**
 * يجلب المنظمات اللي لسا بانتظار قرار الأدمن (status=pending فقط).
 * @returns {Promise<Array<object>>}
 */
export async function fetchPendingOrganizations(governorates = []) {
  return fetchAdminOrganizationList({ status: ORGANIZATION_STATUS.PENDING }, governorates)
}

/**
 * @param {string|number} organizationId
 * @param {{status: 'verified'|'rejected'|'suspended', reason?: string}} decision
 */
export async function reviewOrganization(organizationId, decision) {
  const trimmedReason = String(decision?.reason || '').trim()

  const requiresReason =
    decision?.status === ORGANIZATION_STATUS.REJECTED || decision?.status === ORGANIZATION_STATUS.SUSPENDED

  if (requiresReason && !trimmedReason) {
    const label = decision.status === ORGANIZATION_STATUS.SUSPENDED ? 'Suspension' : 'Rejection'
    return { success: false, error: `${label} reason is required` }
  }

  if (MOCK_MODE) {
    await wait()

    const mockUser = loadMockUsers().find((user) => user.organizationId === organizationId)
    if (!mockUser) return { success: false, error: 'Organization not found' }

    const reviewedAt = new Date().toISOString()
    updateMockUser(mockUser.email, {
      status: decision.status,
      rejectionReason: requiresReason ? trimmedReason : '',
      reviewedAt,
    })

    return { success: true, status: decision.status, reason: trimmedReason, reviewedAt }
  }

  try {
    await apiClient.patch(`/admin/organizations/${organizationId}/verify`, {
      status: decision.status,
      reason: trimmedReason || undefined,
    })
    return { success: true, status: decision.status, reason: trimmedReason }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to submit this decision') }
  }
}


const MOCK_ADMIN_VOLUNTEERS = [
  { id: 'v1', name: 'Lina Haddad', email: 'lina.haddad@example.com', city: 'Damascus', createdAt: daysFromNow(-1), skillsCount: 4, opportunitiesJoinedCount: 3 },
  { id: 'v2', name: 'Omar Al-Khatib', email: 'omar.khatib@example.com', city: 'Aleppo', createdAt: daysFromNow(-2), skillsCount: 2, opportunitiesJoinedCount: 1 },
  { id: 'v3', name: 'Sara Youssef', email: 'sara.youssef@example.com', city: 'Homs', createdAt: daysFromNow(-4), skillsCount: 5, opportunitiesJoinedCount: 6 },
  { id: 'v4', name: 'Khaled Mostafa', email: 'khaled.mostafa@example.com', city: 'Latakia', createdAt: daysFromNow(-6), skillsCount: 3, opportunitiesJoinedCount: 2 },
  { id: 'v5', name: 'Nour Al-Amin', email: 'nour.alamin@example.com', city: 'Tartus', createdAt: daysFromNow(-8), skillsCount: 1, opportunitiesJoinedCount: 0 },
  { id: 'v6', name: 'Rami Sabbagh', email: 'rami.sabbagh@example.com', city: 'Hama', createdAt: daysFromNow(-10), skillsCount: 6, opportunitiesJoinedCount: 4 },
  { id: 'v7', name: 'Dana Kanaan', email: 'dana.kanaan@example.com', city: 'Daraa', createdAt: daysFromNow(-13), skillsCount: 2, opportunitiesJoinedCount: 2 },
  { id: 'v8', name: 'Yousef Barakat', email: 'yousef.barakat@example.com', city: 'Idlib', createdAt: daysFromNow(-18), skillsCount: 3, opportunitiesJoinedCount: 1 },
  { id: 'v9', name: 'Mona Al-Sayed', email: 'mona.alsayed@example.com', city: 'Al-Hasakah', createdAt: daysFromNow(-25), skillsCount: 4, opportunitiesJoinedCount: 5 },
]

// يحوّل فرصة من المخزن الحقيقي (MOCK_OPPORTUNITIES) لشكل قائمة الأدمن —
function toAdminOpportunitySummary(opportunity) {
  return {
    id: opportunity.id,
    title: opportunity.title || '',
    organizationName: opportunity.organization?.name || '',
    city: opportunity.location || '',
    status: getEffectiveOpportunityStatus(opportunity),
    createdAt: opportunity.createdAt || null,
    startDate: opportunity.startDate || null,
  }
}

function mapApiVolunteer(raw, governorates = []) {
  if (!raw) return null

  const user = raw.user || {}
  const skills = Array.isArray(raw.skills) ? raw.skills : []

  return {
    id: raw.id,
    name: [user.first_name, user.last_name].filter(Boolean).join(' '),
    email: user.email || '',
    phone: user.phone_number || '',
    city: getGovernorateSelectValueFromApiCity(raw.city, governorates) || '',
    photo: extractPhotoUrl(raw.photo),
    dateOfBirth: raw.birth_date || null,
    educationLevel: raw.education_level || '',
    gender: raw.gender || '',
    about: raw.about || '',
    skills,
    createdAt: raw.createdAt || raw.created_at || null,
    skillsCount: skills.length,
    opportunitiesJoinedCount:
      raw.opportunitiesJoinedCount ?? raw.opportunities_joined_count ?? undefined,
  }
}

/**
 * يجلب كل المتطوعين المسجّلين بالمنصة — عرض ومراقبة فقط، بلا أي فلترة
 * أو إجراء.
 * @returns {Promise<Array<object>>}
 */
export async function fetchAdminVolunteers(governorates = []) {
  if (MOCK_MODE) {
    await wait()
    return MOCK_ADMIN_VOLUNTEERS
  }

  try {
    const list = await fetchAllAdminPages('/admin/volunteers')
    return list.map((raw) => mapApiVolunteer(raw, governorates))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load admin volunteers'), { cause: error })
  }
}

function mapApiOpportunity(raw, governorates = []) {
  if (!raw) return null

  return {
    id: raw.id,
    title: raw.title || '',
    organizationName: raw.organization?.name || '',
    city: getGovernorateSelectValueFromApiCity(raw.city, governorates) || '',
    status: raw.status || OPPORTUNITY_STATUS.REGISTRATION_OPEN,
    createdAt: raw.created_at || raw.createdAt || null,
    startDate: raw.start_date || raw.startDate || null,
  }
}

/**
 * @returns {Promise<Array<object>>}
 */
export async function fetchAdminOpportunities(governorates = []) {
  if (MOCK_MODE) {
    await wait()
    return MOCK_OPPORTUNITIES.map(toAdminOpportunitySummary)
  }

  try {
    const list = await fetchAllAdminPages('/admin/opportunities')
    return list.map((raw) => mapApiOpportunity(raw, governorates))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load admin opportunities'), { cause: error })
  }
}