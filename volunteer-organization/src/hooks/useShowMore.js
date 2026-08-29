import { useCallback, useMemo, useState } from 'react'

const DEFAULT_INITIAL_COUNT = 6

function areItemsEqual(a, b) {
  if (a === b) return true
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}

/**
 * @param {Array} items - full list, already filtered/searched
 * @param {number} [initialCount]
 */
export function useShowMore(items, initialCount = DEFAULT_INITIAL_COUNT) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const [prevItems, setPrevItems] = useState(items)

  if (!areItemsEqual(items, prevItems)) {
    setPrevItems(items)
    setVisibleCount(initialCount)
  }

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount])
  const hasMore = visibleCount < items.length
  const remainingCount = Math.max(items.length - visibleCount, 0)
  const showMore = useCallback(() => setVisibleCount((count) => count + initialCount), [initialCount])
  const showLess = useCallback(() => setVisibleCount(initialCount), [initialCount])

  return { visibleItems, hasMore, remainingCount, showMore, showLess }
}