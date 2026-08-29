import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteOpportunity } from '../../services/opportunities'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} organizationId - needed to target the "My Causes" cache key
 */
export function useDeleteOpportunityMutation(organizationId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOpportunity,
    onSuccess: (result, id) => {
      if (!result?.success) return

      queryClient.setQueryData(queryKeys.opportunities.mine(organizationId), (current) =>
        Array.isArray(current) ? current.filter((opportunity) => opportunity.id !== id) : current,
      )

      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all })
    },
  })
}