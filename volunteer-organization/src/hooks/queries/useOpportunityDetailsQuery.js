import { useQuery } from '@tanstack/react-query'
import { fetchOpportunityById } from '../../services/opportunities'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} id
 */
export function useOpportunityDetailsQuery(id) {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.opportunities.detail(id),
    queryFn: () => fetchOpportunityById(id, governorates),
    enabled: Boolean(id),
  })
}
