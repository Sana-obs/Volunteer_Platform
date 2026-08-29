import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { MOCK_PARTICIPATIONS } from './mock/mockParticipationsStore'
import { MOCK_OPPORTUNITIES } from './mock/mockOpportunitiesStore'
import { PARTICIPATION_STATUS } from '../constants/participationStatus'
import { OPPORTUNITY_STATUS } from '../constants/opportunityStatus'
import { AUTH_STORAGE_KEY } from '../constants/auth/storage'
import { getEffectiveOpportunityStatus } from '../utils/opportunityStatus'
import { buildVolunteerHoursSummary } from '../utils/volunteerHoursSummary'

const MOCK_MODE = isMockMode()

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'a1',
    name: 'First Volunteering Opportunity',
    description: 'Completed your first volunteering opportunity.',
  },
  {
    id: 'a2',
    name: '10 Volunteer Hours',
    description: 'Reached 10 cumulative volunteering hours.',
  },
  {
    id: 'a3',
    name: 'Completion of Three Group Activities',
    description: 'Completed 3 group volunteering opportunities.',
  },
]

/**
 * @param {Array<{status:string, joinedDate:string, opportunity:{status:string, isGroup?:boolean}|null}>} participations
 */
export function computeAchievementsFromParticipations(participations) {
  const { totalConfirmedHours, completedOpportunitiesCount } = buildVolunteerHoursSummary(participations)

  const completed = participations.filter(
    (participation) =>
      participation.status === PARTICIPATION_STATUS.ACCEPTED &&
      participation.opportunity?.status === OPPORTUNITY_STATUS.COMPLETED,
  )

  const earliestCompleted = [...completed].sort(
    (a, b) => new Date(a.joinedDate) - new Date(b.joinedDate),
  )[0]

  const completedGroup = completed.filter(
    (participation) => participation.opportunity?.isGroup === true,
  )
  const completedGroupOpportunitiesCount = completedGroup.length

  const earliestCompletedGroup = [...completedGroup].sort(
    (a, b) => new Date(a.joinedDate) - new Date(b.joinedDate),
  )[0]

  const unlockedMap = {
    a1: completedOpportunitiesCount >= 1,
    a2: totalConfirmedHours >= 10,
    a3: completedGroupOpportunitiesCount >= 3,
  }

  const earnedDateMap = {
    a1: earliestCompleted?.joinedDate || null,
    a2: earliestCompleted?.joinedDate || null,
    a3: earliestCompletedGroup?.joinedDate || null,
  }

  const progressMap = {
    a1: { current: Math.min(completedOpportunitiesCount, 1), target: 1 },
    a2: { current: Math.min(totalConfirmedHours, 10), target: 10 },
    a3: { current: Math.min(completedGroupOpportunitiesCount, 3), target: 3 },
  }

  return ACHIEVEMENT_DEFINITIONS.map((definition) => ({
    ...definition,
    unlocked: unlockedMap[definition.id] || false,
    earnedDate: unlockedMap[definition.id] ? earnedDateMap[definition.id] || null : null,
    progress: progressMap[definition.id] || null,
  }))
}

/**
 * @param {string} volunteerId
 */
function computeAchievementsForVolunteer(volunteerId) {
  const myParticipations = MOCK_PARTICIPATIONS.filter((p) => p.volunteerId === volunteerId).map(
    (participation) => {
      const opportunity = MOCK_OPPORTUNITIES.find((item) => item.id === participation.opportunityId) || null
      return {
        ...participation,
        opportunity: opportunity ? { ...opportunity, status: getEffectiveOpportunityStatus(opportunity) } : null,
      }
    },
  )

  return computeAchievementsFromParticipations(myParticipations)
}

/**
 * Fetches the FULL achievement catalog for a volunteer, each entry flagged
 * with whether it's unlocked yet (so locked ones can still be displayed).
 * @param {string|number} [volunteerId] - Volunteer id (optional when using token-based "me" auth)
 * @returns {Promise<Array<{id:string, name:string, description:string, unlocked:boolean, earnedDate:string|null, progress:{current:number, target:number}|null}>>}
 */
export async function fetchVolunteerAchievements(volunteerId) {
  if (MOCK_MODE) {
    await wait()

    // لو ما انمرر volunteerId (حالة "me" — صفحة بروفايل المتطوع نفسه)،
    // منحله من الجلسة الحالية بنفس منطق participateInOpportunity بالضبط
    const resolvedId = volunteerId || (() => {
      try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        const email = raw ? JSON.parse(raw)?.user?.email : null
        return email ? `v-${email}` : null
      } catch {
        return null
      }
    })()

    if (!resolvedId) {
      return ACHIEVEMENT_DEFINITIONS.map((definition) => ({
        ...definition,
        unlocked: false,
        earnedDate: null,
        progress: null,
      }))
    }

    return computeAchievementsForVolunteer(resolvedId)
  }

  try {
    const endpoint = volunteerId
      ? `/volunteers/${volunteerId}/achievements`
      : '/volunteers/me/achievements'

    const response = await apiClient.get(endpoint)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load achievements'), { cause: error })
  }
}