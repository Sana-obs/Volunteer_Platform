import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateParticipationStatus } from '../../services/participations'
import { queryKeys } from '../../app/queryKeys'

/**
 * @param {string} opportunityId
 */
export function useUpdateParticipationStatusMutation(opportunityId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ applicantId, status, reason }) => updateParticipationStatus(applicantId, status, reason),
    onSuccess: (result, { applicantId, status }) => {
      if (!result?.success) return

      queryClient.setQueryData(
        queryKeys.participations.applicants(opportunityId),
        (current) =>
          Array.isArray(current)
            ? current.map((applicant) =>
                applicant.id === applicantId ? { ...applicant, status } : applicant,
              )
            : current,
      )

      queryClient.invalidateQueries({ queryKey: queryKeys.participations.mine })

      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.dashboards })
    },
  })
}