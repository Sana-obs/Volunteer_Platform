import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSkill } from '../../services/skills'
import { queryKeys } from '../../app/queryKeys'

export function useDeleteSkillMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: (result, skillId) => {
      if (!result?.success) return

      queryClient.setQueryData(queryKeys.skills.all, (current) =>
        Array.isArray(current) ? current.filter((skill) => skill.id !== skillId) : current,
      )
    },
  })
}