import { useMutation } from '@tanstack/react-query'
import { updateAdminProfile } from '../../services/auth'

export function useUpdateAdminProfileMutation() {
  return useMutation({
    mutationFn: updateAdminProfile,
  })
}
