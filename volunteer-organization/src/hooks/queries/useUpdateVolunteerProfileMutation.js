import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateVolunteerProfile } from '../../services/volunteer'
import { useCitiesQuery } from './useCitiesQuery'
import { queryKeys } from '../../app/queryKeys'


export function useUpdateVolunteerProfileMutation(volunteerId) {
  const queryClient = useQueryClient()
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useMutation({
    mutationFn: (payload) => updateVolunteerProfile(volunteerId, payload, governorates),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.volunteer.profile })
      }
    },
  })
}
