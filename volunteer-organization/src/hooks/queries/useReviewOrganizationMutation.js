import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewOrganization } from '../../services/admin'
import { queryKeys } from '../../app/queryKeys'

export function useReviewOrganizationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationId, status, reason }) =>
      reviewOrganization(organizationId, { status, reason }),
    onSuccess: (result, { organizationId }) => {
      if (!result?.success) return

      queryClient.setQueryData(queryKeys.admin.organizations, (current) =>
        Array.isArray(current)
          ? current.map((organization) =>
              organization.id === organizationId
                ? {
                    ...organization,
                    status: result.status || organization.status,
                    rejectionReason:
                      result.status === 'rejected' ? result.reason || organization.rejectionReason || '' : '',
                  }
                : organization,
            )
          : current,
      )

      queryClient.setQueryData(queryKeys.admin.pendingOrganizations, (current) =>
        Array.isArray(current)
          ? current.filter((organization) => organization.id !== organizationId)
          : current,
      )
    },
  })
}