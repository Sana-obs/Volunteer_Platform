import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGovernorate } from '../../services/syrianGovernorates'
import { queryKeys } from '../../app/queryKeys'

export function useCreateCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGovernorate,
    onSuccess: (result) => {
      if (!result?.success) return
      queryClient.setQueryData(queryKeys.cities.all, (current) =>
        Array.isArray(current) ? [...current, result.data] : current,
      )
    },
  })
}
