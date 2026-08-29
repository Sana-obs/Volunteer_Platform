import { useMutation } from '@tanstack/react-query'
import { updateOrganizationProfile } from '../../services/organization'
import { useCitiesQuery } from './useCitiesQuery'

// id is bound here so callers pass only the profile data.
export function useUpdateOrganizationProfileMutation(organizationId) {
  // Pass the real governorates list so governorate_id maps to the true DB id
  // (local array order was wrong for governorates 9+).
  const citiesQuery = useCitiesQuery()
  const governorates = citiesQuery.data ?? []

  return useMutation({
    mutationFn: (profileData) => updateOrganizationProfile(organizationId, profileData, governorates),
  })
}
