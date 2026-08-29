import { useQuery } from '@tanstack/react-query'
import { fetchOrganizationById } from '../../services/organizations'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} id
 */
export function useOrganizationDetailsQuery(id) {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => fetchOrganizationById(id),
    enabled: Boolean(id),
  })
}