import { useQuery } from '@tanstack/react-query'
import { fetchCompletedOpportunities } from '../../services/opportunities'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

export function useCompletedOpportunitiesQuery() {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.opportunities.completed,
    queryFn: () => fetchCompletedOpportunities(governorates),
  })
}
