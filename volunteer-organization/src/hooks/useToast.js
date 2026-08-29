import { useCallback, useState } from 'react'

/**
 * @param {{message?: string, variant?: 'success'|'error'|'info'}} [initial]
 */
export function useToast(initial = { message: '', variant: 'info' }) {
  const [toast, setToast] = useState(initial)

  const showToast = useCallback((message, variant = 'info', options = {}) => {
    setToast({ message, variant, actionLabel: options.actionLabel, onAction: options.onAction })
  }, [])

  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast])
  const showError = useCallback((message) => showToast(message, 'error'), [showToast])

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: '', actionLabel: undefined, onAction: undefined }))
  }, [])

  return { toast, showToast, showSuccess, showError, closeToast }
}