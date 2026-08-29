import { useQuery } from '@tanstack/react-query'
import { fetchPendingOrganizations } from '../../services/admin'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

export function usePendingOrganizationsQuery() {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.admin.pendingOrganizations,
    queryFn: () => fetchPendingOrganizations(governorates),
  })
}
