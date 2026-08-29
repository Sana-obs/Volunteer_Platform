import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setOpportunityStatus } from '../../services/opportunities'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} organizationId - target for the "My Causes" cache update
 */
export function useToggleOpportunityStatusMutation(organizationId) {
  const queryClient = useQueryClient()
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useMutation({
    mutationFn: ({ id, status }) => setOpportunityStatus(id, status, governorates),
    onSuccess: (result, { id }) => {
      if (!result?.success) return
      const effectiveStatus = result.data?.status
      if (!effectiveStatus) return

      queryClient.setQueryData(queryKeys.opportunities.mine(organizationId), (current) =>
        Array.isArray(current)
          ? current.map((opportunity) =>
              opportunity.id === id ? { ...opportunity, status: effectiveStatus } : opportunity,
            )
          : current,
      )

      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all })
    },
  })
}