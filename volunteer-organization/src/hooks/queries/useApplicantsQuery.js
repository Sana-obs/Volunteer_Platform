import { useQuery } from '@tanstack/react-query'
import { fetchApplicantsForOpportunity } from '../../services/participations'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} opportunityId
 */
export function useApplicantsQuery(opportunityId) {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.participations.applicants(opportunityId),
    queryFn: () => fetchApplicantsForOpportunity(opportunityId, governorates),
    enabled: Boolean(opportunityId),
  })
}
