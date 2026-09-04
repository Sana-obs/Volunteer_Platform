import { useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  fetchOpportunitiesPage,
  fetchSuggestedOpportunities,
} from '../../services/opportunities'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

const EMPTY = []
const noop = () => {}

/**
 * Browse-page data source.
 * - "All" tab: server-side filtered/sorted, paginated via infinite scroll.
 * - "Suggested" tab: one shot from the recommendation endpoint (already scoped).
 *
 * Returns a normalized shape so the page doesn't branch on the query kind:
 *   { opportunities, total, isPending, isFetching, isError, error,
 *     hasNextPage, isFetchingNextPage, fetchNextPage }
 *
 * @param {{isSuggestedTab: boolean, search?: string, categoryId?: string, skillId?: string, location?: string, status?: string, user?: object}} params
 */
export function useOpportunitiesQuery({
  isSuggestedTab,
  search = '',
  categoryId = '',
  skillId = '',
  location = '',
  status = '',
  user,
} = {}) {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? EMPTY

  const suggestedParams = {
    skillIds: Array.isArray(user?.skillIds) ? user.skillIds : [],
    city: user?.city || '',
  }

  const suggestedQuery = useQuery({
    queryKey: queryKeys.opportunities.suggested(suggestedParams),
    queryFn: () => fetchSuggestedOpportunities(suggestedParams, governorates),
    enabled: Boolean(isSuggestedTab),
    placeholderData: (previousData) => previousData,
  })

  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.opportunities.list({
      search,
      categoryId,
      skillId,
      location,
      status,
    }),
    queryFn: ({ pageParam = 1 }) =>
      fetchOpportunitiesPage(
        { page: pageParam, search, categoryId, skillId, location, status },
        governorates,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !isSuggestedTab,
    placeholderData: (previousData) => previousData,
  })

  const listOpportunities = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.items) ?? EMPTY,
    [listQuery.data],
  )

  if (isSuggestedTab) {
    return {
      opportunities: suggestedQuery.data ?? EMPTY,
      total: suggestedQuery.data?.length ?? 0,
      isPending: suggestedQuery.isPending,
      isFetching: suggestedQuery.isFetching,
      isError: suggestedQuery.isError,
      error: suggestedQuery.error,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: noop,
    }
  }

  return {
    opportunities: listOpportunities,
    total: listQuery.data?.pages[0]?.total ?? 0,
    isPending: listQuery.isPending,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    hasNextPage: Boolean(listQuery.hasNextPage),
    isFetchingNextPage: listQuery.isFetchingNextPage,
    fetchNextPage: listQuery.fetchNextPage,
  }
}
