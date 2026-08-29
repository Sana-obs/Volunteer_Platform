
import { PARTICIPATION_STATUS } from '../constants/participationStatus'
import { OPPORTUNITY_STATUS } from '../constants/opportunityStatus'

/**
 * @param {{status:string, opportunity:{status:string}|null}} participation
 */
export function isCompletedParticipation(participation) {
  return (
    participation.status === PARTICIPATION_STATUS.ACCEPTED &&
    participation.opportunity?.status === OPPORTUNITY_STATUS.COMPLETED
  )
}

/**
 * @typedef {Object} OrganizationHoursBreakdown
 * @property {string|number} organizationId
 * @property {string} organizationName
 * @property {number} confirmedHours
 * @property {number} completedOpportunitiesCount
 */

/**
 * @typedef {Object} VolunteerHoursSummary
 * @property {number} totalConfirmedHours 
 * @property {number} totalPledgedHours 
 * @property {number} completedOpportunitiesCount 
 * @property {number} activeOpportunitiesCount 
 * @property {number} organizationsCount 
 * @property {Array<OrganizationHoursBreakdown>} byOrganization
/**

 * @param {Array<{status:string, hoursLogged:number|null, committedHours:number|null, opportunity:{status:string, organization?:{id:string|number, name:string}}|null}>} participations
 * @returns {VolunteerHoursSummary}
 */
export function buildVolunteerHoursSummary(participations = []) {
  const completed = participations.filter(isCompletedParticipation)

  const activeOpportunitiesCount = participations.filter(
    (participation) =>
      participation.status === PARTICIPATION_STATUS.ACCEPTED &&
      participation.opportunity?.status === OPPORTUNITY_STATUS.IN_PROGRESS,
  ).length

  const totalConfirmedHours = completed.reduce(
    (sum, participation) => sum + (Number(participation.hoursLogged) || 0),
    0,
  )

  const totalPledgedHours = participations
    .filter(
      (participation) =>
        participation.status !== PARTICIPATION_STATUS.REJECTED &&
        participation.status !== PARTICIPATION_STATUS.WITHDRAWN,
    )
    .reduce((sum, participation) => sum + (Number(participation.committedHours) || 0), 0)

  const byOrganizationMap = new Map()

  completed.forEach((participation) => {
    const organization = participation.opportunity?.organization
    if (!organization?.id) return

    const entry = byOrganizationMap.get(organization.id) || {
      organizationId: organization.id,
      organizationName: organization.name || 'Organization',
      confirmedHours: 0,
      completedOpportunitiesCount: 0,
    }

    entry.confirmedHours += Number(participation.hoursLogged) || 0
    entry.completedOpportunitiesCount += 1
    byOrganizationMap.set(organization.id, entry)
  })

  const byOrganization = Array.from(byOrganizationMap.values()).sort(
    (a, b) => b.confirmedHours - a.confirmedHours,
  )

  return {
    totalConfirmedHours,
    totalPledgedHours,
    completedOpportunitiesCount: completed.length,
    activeOpportunitiesCount,
    organizationsCount: byOrganization.length,
    byOrganization,
  }
}