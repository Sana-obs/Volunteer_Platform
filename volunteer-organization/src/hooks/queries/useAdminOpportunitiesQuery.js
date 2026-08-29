import { useQuery } from '@tanstack/react-query'
import { fetchAdminOpportunities } from '../../services/admin'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

export function useAdminOpportunitiesQuery() {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.admin.opportunities,
    queryFn: () => fetchAdminOpportunities(governorates),
  })
}
