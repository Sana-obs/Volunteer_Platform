import { useQuery } from '@tanstack/react-query'
import { fetchOpportunities, fetchSuggestedOpportunities } from '../../services/opportunities'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
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
  const suggestedParams = {
    skillIds: Array.isArray(user?.skillIds) ? user.skillIds : [],
    city: user?.city || '',
  }
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: isSuggestedTab
      ? queryKeys.opportunities.suggested(suggestedParams)
      : queryKeys.opportunities.list({ search, categoryId, skillId, location, status }),
    queryFn: () =>
      isSuggestedTab
        ? fetchSuggestedOpportunities(suggestedParams, governorates)
        : fetchOpportunities({ search, categoryId, skillId, location, status }, governorates),

    placeholderData: (previousData) => previousData,
  })
}
