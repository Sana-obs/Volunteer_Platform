import { useEffect, useRef } from 'react'

/**
 * @param {boolean} isOpen
 * @param {() => void} onClose
 */
export default function useClickOutside(isOpen, onClose) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return ref
}