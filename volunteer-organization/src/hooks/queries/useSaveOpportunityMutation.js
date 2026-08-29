import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOpportunity, updateOpportunity } from '../../services/opportunities'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

/**
  * @param {{isEditMode: boolean, id?: string, organizationId?: string, organizationName?: string}} params
 */
export function useSaveOpportunityMutation({ isEditMode, id, organizationId, organizationName }) {
  const queryClient = useQueryClient()
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useMutation({
    mutationFn: (payload) =>
      isEditMode
        ? updateOpportunity(id, payload, governorates)
        : createOpportunity({ ...payload, organizationId, organizationName }, governorates),
    onSuccess: (result) => {
      if (!result?.success) return
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all })
    },
  })
}
