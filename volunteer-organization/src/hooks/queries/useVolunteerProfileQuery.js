import { useQuery } from '@tanstack/react-query'
import { fetchVolunteerProfile } from '../../services/volunteer'
import { isMockMode } from '../../services/api/mockMode'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'

export function useVolunteerProfileQuery() {
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useQuery({
    queryKey: queryKeys.volunteer.profile,
    queryFn: () => fetchVolunteerProfile(governorates),
    enabled: !isMockMode() && governorates.length > 0,
  })
}
