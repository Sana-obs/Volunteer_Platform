import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory } from '../../services/categories'
import { queryKeys } from '../../app/queryKeys'

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      if (!result?.success) return

      queryClient.setQueryData(queryKeys.categories.all, (current) =>
        Array.isArray(current) ? [...current, result.data] : [result.data],
      )
    },
  })
}