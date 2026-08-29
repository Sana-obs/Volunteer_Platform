import { useMutation, useQueryClient } from '@tanstack/react-query'
import { participateInOpportunity } from '../../services/opportunities'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} id
 */
export function useParticipateMutation(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (committedHours) => participateInOpportunity(id, committedHours),
    onSuccess: (result) => {
      if (!result?.success) return

      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all })
    },
  })
}