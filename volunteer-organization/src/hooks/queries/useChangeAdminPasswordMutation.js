import { useMutation } from '@tanstack/react-query'
import { changeAdminPassword } from '../../services/auth'

export function useChangeAdminPasswordMutation() {
  return useMutation({
    mutationFn: changeAdminPassword,
  })
}
