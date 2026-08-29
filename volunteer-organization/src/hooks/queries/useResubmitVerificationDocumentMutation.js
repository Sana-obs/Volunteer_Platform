import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resubmitVerificationDocument } from '../../services/organization'
import { queryKeys } from '../../app/queryKeys'
import { ORGANIZATION_STATUS } from '../../constants/organizationStatus'

export function useResubmitVerificationDocumentMutation(organizationId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (document) => resubmitVerificationDocument(organizationId, document),
    onSuccess: (result) => {
      if (!result?.success) return

      queryClient.setQueryData(queryKeys.organization.profile(organizationId), (current) =>
        current
          ? {
              ...current,
              status: ORGANIZATION_STATUS.PENDING,
              rejectionReason: '',
              verificationDocumentUrl: result.data?.verificationDocumentUrl ?? current.verificationDocumentUrl,
            }
          : current,
      )
    },
  })
}
