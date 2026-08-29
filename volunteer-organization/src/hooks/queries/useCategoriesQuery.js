import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../../services/categories'
import { queryKeys } from '../../app/queryKeys'

// Secondary filter data only, not critical.
export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchCategories,
  })
}