
import { useEffect, useRef, useState } from 'react'

/**
 * @param {number} targetValue
 * @param {number} [durationMs=1200]
 */
export function useCountUp(targetValue, durationMs = 1200) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const elementRef = useRef(null)
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion || !targetValue) return

    const node = elementRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        const startTime = performance.now()

        function tick(now) {
          const progress = Math.min((now - startTime) / durationMs, 1)
          // ease-out for a smooth finish
          const eased = 1 - Math.pow(1 - progress, 3)
          setAnimatedValue(Math.round(eased * targetValue))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.3 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [targetValue, durationMs, prefersReducedMotion])

  const displayValue = prefersReducedMotion || !targetValue ? targetValue || 0 : animatedValue

  return { displayValue, elementRef }
}