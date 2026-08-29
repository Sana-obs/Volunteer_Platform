// Shared image select + validate + preview logic.

import { useState, useCallback } from 'react'
import { validateImageFile } from '../services/api/mediaUpload'

/**
 * @param {string} [initialPreviewUrl]
 */
export function useImageUpload(initialPreviewUrl = '') {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl)
  const [error, setError] = useState('')
  const [removed, setRemoved] = useState(false)

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const { valid, error: validationError } = validateImageFile(selectedFile)
    if (!valid) {
      setError(validationError)
      return
    }

    setError('')
    setFile(selectedFile)
    setRemoved(false)

    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result)
    reader.readAsDataURL(selectedFile)
  }, [])

  const handleRemove = useCallback(() => {
    setFile(null)
    setPreviewUrl('')
    setError('')
    setRemoved(true)
  }, [])

  const reset = useCallback((resetPreviewUrl = '') => {
    setFile(null)
    setPreviewUrl(resetPreviewUrl)
    setError('')
    setRemoved(false)
  }, [])

  return { file, previewUrl, error, removed, handleFileChange, handleRemove, reset, setPreviewUrl }
}