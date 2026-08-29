
import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { ORGANIZATION_STATUS } from '../constants/organizationStatus'
import { ACCOUNT_TYPES } from '../constants/auth/accountTypes'
import { loadMockUsers } from './mock/mockUserStore'

const MOCK_MODE = isMockMode()

const MOCK_ORGANIZATIONS = [
  {
    id: 'org-mock',
    name: 'Rotterdam Community Outreach',
    description: 'Connecting local volunteers with neighborhood initiatives across Rotterdam.',
    city: 'Rotterdam, Netherlands',
    phone: '+31600000000',
    website: '',
    contactPerson: '',
    profileImageUrl: null,
    status: ORGANIZATION_STATUS.VERIFIED,
  },
  {
    id: 'org1',
    name: 'Blue Drop Foundation',
    description: 'Providing clean water access and hygiene education to underserved communities.',
    city: 'Rotterdam, Netherlands',
    phone: '+31611111111',
    website: 'https://bluedrop.example.org',
    contactPerson: 'Amina Youssef',
    profileImageUrl: null,
    status: ORGANIZATION_STATUS.VERIFIED,
  },
  {
    id: 'org2',
    name: 'Bright Minds NGO',
    description: 'After-school tutoring and literacy programs for local students.',
    city: 'The Hague, Netherlands',
    phone: '+31622222222',
    website: 'https://brightminds.example.org',
    contactPerson: 'Karim Haddad',
    profileImageUrl: null,
    status: ORGANIZATION_STATUS.VERIFIED,
  },
  {
    id: 'org3',
    name: 'Green Coast Initiative',
    description: 'Coastal and marine ecosystem cleanup and conservation projects.',
    city: 'Scheveningen, Netherlands',
    phone: '+31633333333',
    website: 'https://greencoast.example.org',
    contactPerson: 'Lina Farouk',
    profileImageUrl: null,
    status: ORGANIZATION_STATUS.VERIFIED,
  },
  {
    id: 'org4',
    name: 'City Food Bank',
    description: 'Fighting food insecurity through community food drives and distribution.',
    city: 'Amsterdam, Netherlands',
    phone: '+31644444444',
    website: 'https://cityfoodbank.example.org',
    contactPerson: 'Omar Al-Sayed',
    profileImageUrl: null,
    status: ORGANIZATION_STATUS.VERIFIED,
  },
  {
    id: 'org5',
    name: 'New Hope Collective',
    description: 'Recently registered — still awaiting verification by the platform admins.',
    city: 'Utrecht, Netherlands',
    phone: '+31655555555',
    website: 'https://newhope.example.org',
    contactPerson: 'Rana Idris',
    profileImageUrl: null,
    status: ORGANIZATION_STATUS.PENDING,
  },
]

/**
  * @param {{status?: string|null}} raw
 */
function isVerifiedOrStatusUnavailable(raw) {
  const status = raw?.status
  if (typeof status === 'undefined' || status === null) return true
  return status === ORGANIZATION_STATUS.VERIFIED
}

/**
 * @param {object} mockUser
 */
function mapMockUserToOrganization(mockUser) {
  return {
    id: mockUser.organizationId,
    name: mockUser.orgName || '',
    description: mockUser.description || '',
    city: mockUser.city || '',
    phone: mockUser.phone || '',
    website: mockUser.website || '',
    contactPerson: mockUser.contactPerson || '',
    profileImageUrl: mockUser.imageUrl || null,
    status: mockUser.status || ORGANIZATION_STATUS.PENDING,
  }
}
function getAllMockOrganizations() {
  const registeredOrganizations = loadMockUsers()
    .filter((user) => user.accountType === ACCOUNT_TYPES.ORGANIZATION && user.organizationId)
    .map(mapMockUserToOrganization)

  return [...MOCK_ORGANIZATIONS, ...registeredOrganizations]
}


function mapOrganizationFromApi(raw) {
  if (!raw) return null

  return {
    id: raw.id,
    name: raw.name || '',
    description: raw.description || '',
    city: raw.city?.nameAr || raw.city?.nameEn || (typeof raw.city === 'string' ? raw.city : ''),
    phone: raw.phone || '',
    website: raw.website || '',
    contactPerson: raw.contact_person || '',
    profileImageUrl: raw.profile_image || null,
    status: raw.status || ORGANIZATION_STATUS.PENDING,
  }
}

/**
 * يستخرج رقم صفحة (?page=N) من رابط Laravel الكامل الذي يرجعه الـ
 * Paginator في links.next/links.prev — يرجّع Number أو null.
 * @param {string|null|undefined} url
 */
function extractPageParam(url) {
  if (typeof url !== 'string' || !url) return null
  const match = url.match(/[?&]page=(\d+)/)
  return match ? Number(match[1]) : null
}

const MOCK_PAGE_SIZE = 15

/**
 * @param {{search?: string, page?: number}} filters
 * @returns {Promise<{data: Array<object>, meta?: {current_page:number, last_page:number, total:number, per_page:number}, links?: {next: string|null, prev: string|null}}>}
 */
export async function fetchOrganizations({ search = '', page = 1 } = {}) {
  if (MOCK_MODE) {
    await wait()

    const verifiedOrganizations = getAllMockOrganizations().filter(
      (organization) => organization.status === ORGANIZATION_STATUS.VERIFIED,
    )

    const normalizedSearch = search.trim().toLowerCase()
    const filtered = normalizedSearch
      ? verifiedOrganizations.filter(
          (organization) =>
            organization.name.toLowerCase().includes(normalizedSearch) ||
            organization.city.toLowerCase().includes(normalizedSearch),
        )
      : verifiedOrganizations

    const total = filtered.length
    const lastPage = Math.max(Math.ceil(total / MOCK_PAGE_SIZE), 1)
    const currentPage = Math.min(Math.max(page, 1), lastPage)
    const start = (currentPage - 1) * MOCK_PAGE_SIZE

    return {
      data: filtered.slice(start, start + MOCK_PAGE_SIZE),
      meta: { current_page: currentPage, last_page: lastPage, total, per_page: MOCK_PAGE_SIZE },
      links: {
        next: currentPage < lastPage ? String(currentPage + 1) : null,
        prev: currentPage > 1 ? String(currentPage - 1) : null,
      },
    }
  }

  try {
    const response = await apiClient.get('/organizations', {
      params: { search, status: ORGANIZATION_STATUS.VERIFIED, page },
    })

    const rawList = Array.isArray(response.data) ? response.data : response.data?.data || []
    const rawMeta = response.meta ?? (Array.isArray(response.data) ? undefined : response.data?.meta)
    const rawLinks = response.links ?? (Array.isArray(response.data) ? undefined : response.data?.links)

    const meta = rawMeta
      ? {
          current_page: rawMeta.currentPage ?? rawMeta.current_page,
          last_page: rawMeta.lastPage ?? rawMeta.last_page,
          total: rawMeta.total,
          per_page: rawMeta.perPage ?? rawMeta.per_page,
        }
      : undefined

    return {
      data: rawList.filter(isVerifiedOrStatusUnavailable).map(mapOrganizationFromApi),
      meta,
      links: rawLinks
        ? { next: extractPageParam(rawLinks.next), prev: extractPageParam(rawLinks.prev) }
        : undefined,
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load organizations'), { cause: error })
  }
}

/**
 * يجلب منظمة واحدة بتفاصيلها الكاملة (لصفحة العرض العامة، ليس بروفايل "منظمتي").
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function fetchOrganizationById(id) {
  if (MOCK_MODE) {
    await wait()
    return getAllMockOrganizations().find((organization) => organization.id === id) || null
  }

  try {
    const response = await apiClient.get(`/organizations/${id}`)
    return mapOrganizationFromApi(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load this organization'), { cause: error })
  }
}