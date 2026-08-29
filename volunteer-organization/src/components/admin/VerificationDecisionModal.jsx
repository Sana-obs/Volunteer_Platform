// Confirms a negative decision on an organization (reject or suspend); reason is mandatory.

import { useState } from 'react'
import Modal from '../ui/Modal'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

const MODE_COPY = {
  reject: {
    title: (name) => `Reject ${name || 'organization'}?`,
    description:
      'The organization stays visible in the review list, but its status will change to rejected. Add a short reason so the team knows what to fix before requesting verification again.',
    confirmLabel: 'Confirm rejection',
    loadingText: 'Submitting...',
    placeholder: 'e.g. The uploaded document is unreadable, please re-upload a clearer copy.',
    errorMessage: 'Rejection reason is required.',
  },
  suspend: {
    title: (name) => `Suspend ${name || 'organization'}?`,
    description:
      'The organization will no longer be able to publish or manage opportunities until reinstated. Add a short reason for the record: it will be shown to the organization.',
    confirmLabel: 'Confirm suspension',
    loadingText: 'Suspending...',
    placeholder: 'e.g. Multiple reports of misleading opportunity listings.',
    errorMessage: 'Suspension reason is required.',
  },
}

/**
 * @param {'reject'|'suspend'} [mode]
 */
export default function VerificationDecisionModal({
  open,
  organizationName,
  mode = 'reject',
  onClose,
  onConfirm,
  isSubmitting,
}) {
  const [reason, setReason] = useState('')
  const [hasAttemptedConfirm, setHasAttemptedConfirm] = useState(false)
  const copy = MODE_COPY[mode] ?? MODE_COPY.reject

  const trimmedReason = reason.trim()
  const reasonError = hasAttemptedConfirm && !trimmedReason ? copy.errorMessage : ''

  const handleConfirm = () => {
    setHasAttemptedConfirm(true)

    if (!trimmedReason) return

    onConfirm(trimmedReason)
    setReason('')
    setHasAttemptedConfirm(false)
  }

  const handleClose = () => {
    setReason('')
    setHasAttemptedConfirm(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={copy.title(organizationName)}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isSubmitting || !trimmedReason}
            isLoading={isSubmitting}
            loadingText={copy.loadingText}
          >
            {copy.confirmLabel}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-body">{copy.description}</p>

      <Textarea
        name="decisionReason"
        placeholder={copy.placeholder}
        rows={4}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        error={reasonError}
      />
    </Modal>
  )
}