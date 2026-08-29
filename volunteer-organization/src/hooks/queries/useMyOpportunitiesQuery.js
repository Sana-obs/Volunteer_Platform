import { useQuery } from '@tanstack/react-query'
import { fetchMyOpportunities } from '../../services/opportunities'
import { isMockMode } from '../../services/api/mockMode'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} organizationId
 */
export function useMyOpportunitiesQuery(organizationId) {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.opportunities.mine(organizationId),
    queryFn: () => fetchMyOpportunities(organizationId, governorates),
    enabled: isMockMode() || Boolean(organizationId),
  })
}