import { useQuery } from '@tanstack/react-query'
import { fetchGovernorates } from '../../services/syrianGovernorates'
import { queryKeys } from '../../app/queryKeys'

export function useCitiesQuery() {
  return useQuery({
    queryKey: queryKeys.cities.all,
    queryFn: fetchGovernorates,
  })
}
