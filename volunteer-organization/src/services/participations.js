import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { wait } from './api/delay'
import { fetchOpportunities, mapApiOpportunity } from './opportunities'
import { getEffectiveParticipationStatus, PARTICIPATION_STATUS } from '../constants/participationStatus'
import { MOCK_PARTICIPATIONS, MOCK_VOLUNTEER_PROFILES, persistMockParticipations } from './mock/mockParticipationsStore'
import { fetchVolunteerAchievements } from './achievements'
import { buildVolunteerHoursSummary } from '../utils/volunteerHoursSummary'
import { extractPhotoUrl } from '../utils/extractPhotoUrl'
import { normalizeUser } from '../utils/auth/normalizeUser'

import { canWithdraw } from '../utils/participationPolicy'

const MOCK_MODE = isMockMode()

/**
 * Fetches the current volunteer's participations (joined opportunities).
 * @returns {Promise<Array<{opportunityId:string, status:string, hoursLogged:number, joinedDate:string, opportunity:object,
 *   rejectionReason?:string, withdrawnDate?:string, canWithdraw?:boolean}>>}
 */
export async function fetchMyParticipations(governorates = []) {
  if (MOCK_MODE) {
    await wait()
    const opportunities = await fetchOpportunities()
    return MOCK_PARTICIPATIONS.map((participation) => {
      const opportunity = opportunities.find((item) => item.id === participation.opportunityId) || null
      return {
        ...participation,
        status: opportunity ? getEffectiveParticipationStatus(participation, opportunity) : participation.status,
        opportunity,
      }
    }).filter((participation) => participation.opportunity)
  }

  try {
    const response = await apiClient.get('/volunteers/me/participations')
    const data = Array.isArray(response.data) ? response.data : []
    // نفس تصفية فرع mock بالأعلى بالضبط — نستبعد أي مشاركة وصلت بدون
    // علاقة opportunity محمّلة فعليًا (مثلًا الفرصة انحذفت لاحقًا من طرف
    // المنظمة)، وإلا ParticipationCard.jsx بينكسر (بيعتمد على
    // opportunity.id/opportunity.title مباشرة بدون أي تحقق دفاعي).
    //
    // ⚠️ opportunity المتداخلة تجي خام (snake_case، city متداخلة {id,nameEn})
    // تمامًا زي GET /opportunities — لازم تمرّ بـ mapApiOpportunity حتى
    // ParticipationCard.jsx يشوف location وstartDate بالشكل المسطّح
    // (camelCase) يلي بيتوقعه، نفس ما بيصير بـ fetchOpportunities بالضبط.
    return data
      .filter((participation) => participation.opportunity)
      .map((participation) => ({
        ...participation,
        opportunity: mapApiOpportunity(participation.opportunity, governorates),
      }))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load your volunteering history'), { cause: error })
  }
}

/**
 * يجلب المتقدمين على فرصة معيّنة (لصفحة "قائمة المتقدمين" عند المنظمة).
 * @param {string} opportunityId
 */


export async function fetchApplicantsForOpportunity(opportunityId, governorates = []) {
  if (MOCK_MODE) {
    await wait()
    const opportunities = await fetchOpportunities()
    const opportunity = opportunities.find((item) => item.id === opportunityId) || null
    const organizationId = opportunity?.organization?.id

    const applicants = MOCK_PARTICIPATIONS.filter(
      (participation) => participation.opportunityId === opportunityId,
    )

    return Promise.all(
      applicants.map(async (participation) => {
        const volunteerProfile = MOCK_VOLUNTEER_PROFILES[participation.volunteerId] || null

        let completedOpportunitiesCount = 0
        let totalHoursVolunteered = 0
        let achievements = []

        if (volunteerProfile && organizationId) {
          const enrichedParticipations = MOCK_PARTICIPATIONS.filter(
            (item) => item.volunteerId === participation.volunteerId,
          ).map((item) => ({
            ...item,
            opportunity: opportunities.find((o) => o.id === item.opportunityId) || null,
          }))

          const hoursSummary = buildVolunteerHoursSummary(enrichedParticipations)
          const orgEntry = hoursSummary.byOrganization.find(
            (entry) => entry.organizationId === organizationId,
          )

          completedOpportunitiesCount = orgEntry?.completedOpportunitiesCount || 0
          totalHoursVolunteered = orgEntry?.confirmedHours || 0
          achievements = await fetchVolunteerAchievements(participation.volunteerId)
        }

        return {
          id: participation.id,
          status: opportunity
            ? getEffectiveParticipationStatus(participation, opportunity)
            : participation.status,

          // MOCK ALREADY HAS participatedAt
          participatedAt: participation.joinedDate,

          committedHours: participation.committedHours,
          hoursLogged: participation.hoursLogged,

          volunteer: volunteerProfile
            ? {
                ...volunteerProfile,
                photo: extractPhotoUrl(volunteerProfile.photo),
                completedOpportunitiesCount,
                totalHoursVolunteered,
                achievements,
              }
            : null,
        }
      }),
    )
  }

  try {
    const response = await apiClient.get(`/opportunities/${opportunityId}/participants`)
    const applicants = Array.isArray(response.data) ? response.data : []

    return applicants.map((applicant) => ({
      ...applicant,

      participatedAt: applicant.joinedDate,

      volunteer: mapApiApplicantVolunteer(applicant.volunteer, governorates),
    }))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load applicants'), { cause: error })
  }
}

function mapApiApplicantVolunteer(rawUser, governorates = []) {
  if (!rawUser) return null

  const normalized = normalizeUser(rawUser, governorates)
  if (!normalized) return null

  return {
    ...normalized,
    name: normalized.displayName,
    photo: normalized.avatarUrl,
    skills: normalized.skillNames || [],
  }
}

/**
 * نقطة موحّدة لتغيير حالة طلب مشاركة — تُستخدم من طرف المنظمة (accepted/rejected).
 * @param {string} participationId
 * @param {string} status
 * @param {string} [reason] - سبب الرفض (إلزامي بالواجهة عبر RejectionReasonModal
 */
export async function updateParticipationStatus(participationId, status, reason) {
  if (MOCK_MODE) {
    await wait()
    const participation = MOCK_PARTICIPATIONS.find((item) => item.id === participationId)
    if (participation) {
      participation.status = status
      // السبب بس بيتخزّن لما القرار فعليًا رفض — قبول ما إله سبب
      if (status === PARTICIPATION_STATUS.REJECTED) participation.rejectionReason = reason
      persistMockParticipations()
    }
    return { success: true }
  }

  try {
    await apiClient.patch(`/participations/${participationId}/decide`, { status, rejection_reason: reason })
    return { success: true }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to update this request') }
  }
}

/**
 * @param {string} participationId
 */
export async function withdrawParticipation(participationId) {
  if (MOCK_MODE) {
    await wait()
    const participation = MOCK_PARTICIPATIONS.find((item) => item.id === participationId)
    if (!participation) return { success: false, error: 'Participation not found' }


    const opportunities = await fetchOpportunities()
    const opportunity = opportunities.find((item) => item.id === participation.opportunityId) || null
    if (!canWithdraw({ ...participation, opportunity })) {
      return { success: false, error: 'This participation can no longer be withdrawn' }
    }

    participation.status = PARTICIPATION_STATUS.WITHDRAWN
    participation.withdrawnDate = new Date().toISOString().slice(0, 10)
    persistMockParticipations()
    return { success: true }
  }

  try {
    await apiClient.patch(`/participations/${participationId}/withdraw`, { status: PARTICIPATION_STATUS.WITHDRAWN })
    return { success: true }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to withdraw from this opportunity') }
  }
}

/**
 * تحدّث الساعات النهائية المؤكدة لمشاركة معيّنة (بعد انتهاء الفرصة).
 * نفس نمط {success,error} المستخدم بـ updateParticipationStatus.
 * @param {string} participationId
 * @param {number} hours
 */
export async function updateParticipationHours(participationId, hours) {
  if (MOCK_MODE) {
    await wait()

    const participation = MOCK_PARTICIPATIONS.find((item) => item.id === participationId)
    if (!participation) return { success: false, error: 'Participation not found' }

    participation.hoursLogged = hours
    persistMockParticipations()
    return { success: true }
  }

  try {
    await apiClient.patch(`/participations/${participationId}/hours`, { hours })
    return { success: true }
  } catch (error) {
    return { success: false, error: getApiErrorMessage(error, 'Failed to update hours') }
  }
}