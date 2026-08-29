import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCategory } from '../../services/categories'
import { queryKeys } from '../../app/queryKeys'

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, payload }) => updateCategory(categoryId, payload),
    onSuccess: (result, { categoryId }) => {
      if (!result?.success) return

      queryClient.setQueryData(queryKeys.categories.all, (current) =>
        Array.isArray(current)
          ? current.map((category) =>
              category.id === categoryId ? { ...category, ...result.data } : category,
            )
          : current,
      )
    },
  })
}