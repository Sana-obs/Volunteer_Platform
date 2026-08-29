import { useQuery } from '@tanstack/react-query'
import { fetchOpportunitiesByOrganization } from '../../services/opportunities'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
 * Kept separate from useOrganizationDetailsQuery so a slow/failed opportunities
 * fetch doesn't block the organization data.
 * @param {string} organizationId
 */
export function useOrganizationOpportunitiesQuery(organizationId) {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.organizations.opportunities(organizationId),
    queryFn: () => fetchOpportunitiesByOrganization(organizationId, governorates),
    enabled: Boolean(organizationId),
  })
}
