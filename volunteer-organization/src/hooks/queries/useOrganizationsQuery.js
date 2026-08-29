import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchOrganizations } from '../../services/organizations'
import { queryKeys } from '../../app/queryKeys'

/**
  * @param {{search?: string}} filters
 */
export function useOrganizationsQuery({ search = '' } = {}) {
  return useInfiniteQuery({
  
    queryKey: queryKeys.organizations.list({ search }),
    queryFn: ({ pageParam }) => fetchOrganizations({ search, page: pageParam }),
    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta
      if (meta && typeof meta.current_page === 'number' && typeof meta.last_page === 'number') {
        return meta.current_page < meta.last_page ? meta.current_page + 1 : undefined
      }

      return lastPage?.links?.next ? Number(lastPage.links.next) : undefined
    },
  
    placeholderData: (previousData) => previousData,
  })
}
