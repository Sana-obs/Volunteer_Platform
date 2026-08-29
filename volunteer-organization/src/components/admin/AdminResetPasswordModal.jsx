import { useEffect, useRef, useState } from 'react'
import { KeyRound, MailCheck } from 'lucide-react'

import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Typography from '../ui/Typography'

export default function AdminResetPasswordModal({ open, onClose, email }) {
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const sendTimeoutRef = useRef(null)
  // Reset local state on reopen (during render, per React's prop-change pattern).
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setIsSending(false)
      setIsSent(false)
    }
  }

  // Clear the pending timer on close/unmount so a stale one can't flip isSent in a new session.
  useEffect(() => {
    return () => clearTimeout(sendTimeoutRef.current)
  }, [open])

  const handleSendResetLink = () => {
    setIsSending(true)

    // TODO: wire to the real Laravel reset endpoint; this flow is mocked (no email sent).
    clearTimeout(sendTimeoutRef.current)
    sendTimeoutRef.current = setTimeout(() => {
      setIsSending(false)
      setIsSent(true)
    }, 700)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset password"
      footer={
        isSent ? (
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendResetLink}
              isLoading={isSending}
              loadingText="Sending..."
            >
              Send reset link
            </Button>
          </>
        )
      }
    >
      {isSent ? (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
            <MailCheck size={22} aria-hidden="true" />
          </div>
          <Typography variant="bodySm" className="text-body">
            If an account exists for <span className="font-medium text-heading">{email}</span>, a reset link has
            been sent.
          </Typography>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <KeyRound size={20} aria-hidden="true" />
            </div>
            <Typography variant="bodySm" className="text-body">
              We'll send a password reset link to the email address on this admin account. Use it to set a new
              password from a fresh browser session.
            </Typography>
          </div>

          <div className="rounded-2xl border border-heading/10 bg-heading/5 px-4 py-3">
            <Typography variant="overline" className="text-body/70">
              Reset link will be sent to
            </Typography>
            <Typography variant="body" className="mt-1 font-medium">
              {email || 'No email on file'}
            </Typography>
          </div>
        </div>
      )}
    </Modal>
  )
}
