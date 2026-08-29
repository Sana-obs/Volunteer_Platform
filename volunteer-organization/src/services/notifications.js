import { apiClient, getApiErrorMessage } from './api/client'
import { isMockMode } from './api/mockMode'
import { fetchVolunteerAchievements } from './achievements'
import { fetchMyParticipations, fetchApplicantsForOpportunity } from './participations'
import { fetchOrganizationProfile } from './organization'
import { fetchMyOpportunities } from './opportunities'
import { fetchPendingOrganizations } from './admin'
import {
  getSeenAchievementNotificationIds,
  markAchievementNotificationIdsSeen,
} from '../utils/achievementNotificationSeenTracker'
import { getSeenHoursMap, markHoursSeen } from '../utils/hoursSeenTracker'
import { getSeenStatusMap, markStatusSeen } from '../utils/participationStatusSeenTracker'
import { getSeenOrganizationStatusMap, markOrganizationStatusSeen } from '../utils/organizationVerificationSeenTracker'
import { getSeenApplicantStatusMap, markApplicantStatusSeen } from '../utils/organizationApplicantSeenTracker'
import { getSeenPendingOrganizationIds, markPendingOrganizationSeen } from '../utils/pendingOrganizationSeenTracker'
import { PARTICIPATION_STATUS } from '../constants/participationStatus'
import { ORGANIZATION_STATUS } from '../constants/organizationStatus'
import { ACCOUNT_TYPES } from '../constants/auth/accountTypes'
import { ROUTES } from '../constants/paths'
import { getDaysUntilStart } from '../utils/opportunityStatus'

const MOCK_MODE = isMockMode()


function buildAchievementItems(achievements, seenAchievements) {
  return achievements
    .filter((achievement) => achievement.unlocked && !seenAchievements.has(achievement.id))
    .map((achievement) => ({
      id: `achievement:${achievement.id}`,
      type: 'achievement',
      title: 'New achievement unlocked',
      description: achievement.name,
      href: ROUTES.MY_JOURNEY,
      onDismiss: () => markAchievementNotificationIdsSeen(new Set([...seenAchievements, achievement.id])),
    }))
}


function buildParticipationItems(participations, seenHours, seenStatus) {
  const items = []

  participations.forEach((participation) => {
    const opportunityTitle = participation.opportunity?.title || 'an opportunity'

    const hasNewHours =
      participation.hoursLogged !== null &&
      participation.hoursLogged !== undefined &&
      Number(seenHours.get(participation.id)) !== Number(participation.hoursLogged)

    if (hasNewHours) {
      items.push({
        id: `hours:${participation.id}`,
        type: 'hours',
        title: 'Hours confirmed',
        description: `${opportunityTitle}: ${participation.hoursLogged} hrs`,
        href: ROUTES.MY_VOLUNTEERING,
        onDismiss: () => markHoursSeen(participation.id, participation.hoursLogged),
      })
    }

    const isDecided =
      participation.status === PARTICIPATION_STATUS.ACCEPTED ||
      participation.status === PARTICIPATION_STATUS.REJECTED

    if (isDecided && seenStatus.get(participation.id) !== participation.status) {
      items.push({
        id: `status:${participation.id}`,
        type:
          participation.status === PARTICIPATION_STATUS.ACCEPTED
            ? 'status-accepted'
            : 'status-rejected',
        title:
          participation.status === PARTICIPATION_STATUS.ACCEPTED
            ? 'Your request was accepted'
            : 'Your request was declined',
        description: opportunityTitle,
        href: ROUTES.MY_VOLUNTEERING,
        onDismiss: () => markStatusSeen(participation.id, participation.status),
      })
    }
  })

  return items
}

function buildOrganizationVerificationItems(organization, seenStatus) {
  if (!organization) return []

  const isDecided =
    organization.status === ORGANIZATION_STATUS.VERIFIED ||
    organization.status === ORGANIZATION_STATUS.REJECTED

  if (!isDecided || seenStatus.get(String(organization.id)) === organization.status) return []

  const isVerified = organization.status === ORGANIZATION_STATUS.VERIFIED

  return [
    {
      id: `org-verification:${organization.id}:${organization.status}`,
      type: isVerified ? 'org-verified' : 'org-rejected',
      title: isVerified ? 'Your organization has been verified' : 'Verification request rejected',
      description: isVerified
        ? 'You can now post opportunities and use all organization features.'
        : organization.rejectionReason || 'Upload a new verification document to request another review.',
      href: ROUTES.ORGANIZATION_PROFILE,
      onDismiss: () => markOrganizationStatusSeen(organization.id, organization.status),
    },
  ]
}


function buildUpcomingOpportunityReminderItems(participations) {
  return participations
    .filter(
      (participation) =>
        participation.status === PARTICIPATION_STATUS.ACCEPTED &&
        getDaysUntilStart(participation.opportunity?.startDate) !== null,
    )
    .map((participation) => ({
      id: `reminder:${participation.id}`,
      type: 'opportunity-reminder',
      title: 'Upcoming opportunity',
      description: `"${participation.opportunity?.title || 'Your opportunity'}" starts soon — don't miss it.`,
      href: ROUTES.MY_VOLUNTEERING,
    }))
}

async function buildApplicantActivityItems(seenApplicantStatus) {
  const opportunities = await fetchMyOpportunities()

  const applicantsPerOpportunity = await Promise.all(
    opportunities.map((opportunity) =>
      fetchApplicantsForOpportunity(opportunity.id).then((applicants) => ({ opportunity, applicants })),
    ),
  )

  const items = []

  applicantsPerOpportunity.forEach(({ opportunity, applicants }) => {
    applicants.forEach((applicant) => {
      const isNewToOrganization = seenApplicantStatus.get(String(applicant.id)) !== applicant.status
      if (!isNewToOrganization) return

      const volunteerName = applicant.volunteer?.name || 'A volunteer'
      const dismiss = () => markApplicantStatusSeen(applicant.id, applicant.status)

      if (applicant.status === PARTICIPATION_STATUS.PENDING) {
        items.push({
          id: `new-applicant:${applicant.id}`,
          type: 'applicant-new',
          title: 'New volunteer application',
          description: `${volunteerName} applied to "${opportunity.title}"`,
          href: `${ROUTES.APPLICANTS}/${opportunity.id}`,
          onDismiss: dismiss,
        })
      } else if (applicant.status === PARTICIPATION_STATUS.WITHDRAWN) {
        items.push({
          id: `withdrawal:${applicant.id}`,
          type: 'applicant-withdrawn',
          title: 'A volunteer withdrew',
          description: `${volunteerName} withdrew from "${opportunity.title}"`,
          href: `${ROUTES.APPLICANTS}/${opportunity.id}`,
          onDismiss: dismiss,
        })
      }
    })
  })

  return items
}

function buildPendingOrganizationItems(pendingOrganizations, seenOrgIds) {
  return pendingOrganizations
    .filter((organization) => !seenOrgIds.has(String(organization.id)))
    .map((organization) => ({
      id: `pending-org:${organization.id}`,
      type: 'pending_organization',
      title: 'New organization awaiting verification',
      description: organization.name || 'Untitled organization',
      href: ROUTES.ADMIN_ORGANIZATIONS,
      onDismiss: () =>
        markPendingOrganizationSeen(
          organization.id,
          new Set([...seenOrgIds, String(organization.id)]),
        ),
    }))
}


const NOTIFICATION_TYPE_HREF_FALLBACK = {
  achievement: ROUTES.MY_JOURNEY,
  hours: ROUTES.MY_VOLUNTEERING,
  'status-accepted': ROUTES.MY_VOLUNTEERING,
  'status-rejected': ROUTES.MY_VOLUNTEERING,
  'opportunity-reminder': ROUTES.MY_VOLUNTEERING,
  'org-verified': ROUTES.ORGANIZATION_PROFILE,
  'org-rejected': ROUTES.ORGANIZATION_PROFILE,
  'org-pending': ROUTES.ADMIN_ORGANIZATIONS,
}

async function fetchRealNotificationItems() {
  try {
    
    const response = await apiClient.get('/notifications', { params: { unread: true } })
    const data = Array.isArray(response.data) ? response.data : []

    return data
      .filter((item) => !item.seen)
      .map((item) => ({
        id: item.id,
        type: item.type || 'update',
        title: item.title || 'New update',
        description: item.description || item.message || '',
        href:
          item.href ||
          item.link ||
          NOTIFICATION_TYPE_HREF_FALLBACK[item.type] ||
          ROUTES.HOME,
        onDismiss: () => apiClient.patch(`/notifications/${item.id}/read`),
      }))
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load notifications'), { cause: error })
  }
}

/** 
 * @param {{accountType?: string, organizationId?: string|number}} [context]
 * @returns {Promise<Array<{id:string, type:string, title:string, description:string, href:string}>>}
 */
export async function fetchRecentNotifications({ accountType, organizationId } = {}) {
  if (accountType === ACCOUNT_TYPES.ORGANIZATION) {
    if (!organizationId) return []

    if (!MOCK_MODE) return fetchRealNotificationItems()

    const profile = await fetchOrganizationProfile(organizationId)
    const verificationItems = buildOrganizationVerificationItems(profile, getSeenOrganizationStatusMap())

    const applicantActivityItems =
      profile?.status === ORGANIZATION_STATUS.VERIFIED
        ? await buildApplicantActivityItems(getSeenApplicantStatusMap())
        : []

    return [...verificationItems, ...applicantActivityItems]
  }

  // مسار الأدمن
  if (accountType === ACCOUNT_TYPES.ADMIN) {
    if (!MOCK_MODE) return fetchRealNotificationItems()

    // فرع Mock فقط: fetchPendingOrganizations بتتعامل مع mock داخليًا
    const pendingOrganizations = await fetchPendingOrganizations()
    return buildPendingOrganizationItems(pendingOrganizations, getSeenPendingOrganizationIds())
  }

  if (MOCK_MODE) {
    const [achievements, participations] = await Promise.all([
      fetchVolunteerAchievements(),
      fetchMyParticipations(),
    ])

    const achievementItems = buildAchievementItems(achievements, getSeenAchievementNotificationIds())
    const participationItems = buildParticipationItems(
      participations,
      getSeenHoursMap(),
      getSeenStatusMap(),
    )
    const reminderItems = buildUpcomingOpportunityReminderItems(participations)

    return [...achievementItems, ...participationItems, ...reminderItems]
  }

  return fetchRealNotificationItems()
}