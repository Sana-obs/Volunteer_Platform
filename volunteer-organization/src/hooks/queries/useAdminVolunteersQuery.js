import { useQuery } from '@tanstack/react-query'
import { fetchAdminVolunteers } from '../../services/admin'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

export function useAdminVolunteersQuery() {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.admin.volunteers,
    queryFn: () => fetchAdminVolunteers(governorates),
  })
}
