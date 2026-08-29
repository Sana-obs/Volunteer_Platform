import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSkill } from '../../services/skills'
import { queryKeys } from '../../app/queryKeys'

export function useUpdateSkillMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ skillId, payload }) => updateSkill(skillId, payload),
    onSuccess: (result) => {
      if (!result?.success) return
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all })
    },
  })
}