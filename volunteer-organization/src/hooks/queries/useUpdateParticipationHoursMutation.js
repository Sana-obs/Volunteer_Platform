import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateParticipationHours } from '../../services/participations'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} opportunityId
 */
export function useUpdateParticipationHoursMutation(opportunityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicantId, hours }) => updateParticipationHours(applicantId, hours),
    onSuccess: (result, { applicantId, hours }) => {
      if (!result?.success) return

      queryClient.setQueryData(
        queryKeys.participations.applicants(opportunityId),
        (current) =>
          Array.isArray(current)
            ? current.map((applicant) =>
                applicant.id === applicantId ? { ...applicant, hoursLogged: hours } : applicant,
              )
            : current,
      )

      queryClient.invalidateQueries({ queryKey: queryKeys.participations.mine })
      // Dashboard "Total Hours" lives under a separate cache key, so invalidate it too.
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.dashboards })
    },
  })
}