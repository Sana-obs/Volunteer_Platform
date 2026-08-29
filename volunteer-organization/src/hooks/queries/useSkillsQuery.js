import { useQuery } from '@tanstack/react-query'
import { fetchAvailableSkills } from '../../services/skills'
import { queryKeys } from '../../app/queryKeys'


export function useSkillsQuery() {
  return useQuery({
    queryKey: queryKeys.skills.all,
    queryFn: fetchAvailableSkills,
  })
}