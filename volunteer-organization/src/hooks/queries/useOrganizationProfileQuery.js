import { useQuery } from '@tanstack/react-query'
import { fetchOrganizationProfile } from '../../services/organization'
import { isMockMode } from '../../services/api/mockMode'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {number|string} organizationId
 */
export function useOrganizationProfileQuery(organizationId) {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.organization.profile(organizationId),
    queryFn: () => fetchOrganizationProfile(organizationId, governorates),
    enabled: isMockMode() || (Boolean(organizationId) && governorates.length > 0),
  })
}
