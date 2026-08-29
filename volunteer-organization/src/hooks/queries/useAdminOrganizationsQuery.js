import { useQuery } from '@tanstack/react-query'
import { fetchAdminOrganizations } from '../../services/admin'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

export function useAdminOrganizationsQuery() {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.admin.organizations,
    queryFn: () => fetchAdminOrganizations(governorates),
  })
}
