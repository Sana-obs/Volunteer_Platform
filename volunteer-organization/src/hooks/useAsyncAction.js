import { useCallback, useState } from 'react'

export default function useAsyncAction(action) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError('')

      try {
        const result = await action(...args)
        if (!result?.success) {
          const message = result?.error || 'Something went wrong'
          setError(message)
          return { ...result, success: false, error: message, fieldErrors: result?.fieldErrors || null }
        }

        return result
      } catch (actionError) {
        const message = actionError instanceof Error ? actionError.message : 'Unexpected error'
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [action],
  )

  return { loading, error, execute, clearError }
}