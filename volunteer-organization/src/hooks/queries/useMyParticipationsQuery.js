import { useQuery } from '@tanstack/react-query'
import { fetchMyParticipations } from '../../services/participations'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

export function useMyParticipationsQuery() {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.participations.mine,
    queryFn: () => fetchMyParticipations(governorates),
  })
}
