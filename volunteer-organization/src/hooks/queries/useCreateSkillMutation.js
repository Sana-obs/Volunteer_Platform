import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSkill } from '../../services/skills'
import { queryKeys } from '../../app/queryKeys'

export function useCreateSkillMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all })
    },
  })
}