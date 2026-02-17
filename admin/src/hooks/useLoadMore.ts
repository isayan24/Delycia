import { useState, useEffect, useCallback, useRef } from 'react'

interface UseLoadMoreResult<T> {
  visibleItems: T[]
  hasMore: boolean
  sentinelRef: React.RefCallback<HTMLElement>
  resetVisibleCount: () => void
}

/**
 * Progressive rendering hook using Intersection Observer.
 * Given a full array of items, returns a growing slice that
 * expands by `batchSize` each time the sentinel element scrolls
 * into view. Automatically resets when the source array changes.
 */
export function useLoadMore<T>(
  items: T[],
  batchSize = 10,
): UseLoadMoreResult<T> {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelNodeRef = useRef<HTMLElement | null>(null)

  const prevItemsRef = useRef(items)

  // Reset visible count only when the source data fundamentally changes (e.g. search/filter)
  useEffect(() => {
    setVisibleCount((prev) => {
      // If list emptied or first item changed (new search/filter), reset
      if (items.length === 0 || items[0] !== prevItemsRef.current[0]) {
        return batchSize
      }
      // If list shrank significantly, reset
      if (items.length < prevItemsRef.current.length) {
        return batchSize
      }
      // If it's an append or same list, maintain current count
      return prev
    })
    prevItemsRef.current = items
  }, [items, batchSize])

  const hasMore = visibleCount < items.length
  const visibleItems = items.slice(0, visibleCount)

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, items.length))
  }, [batchSize, items.length])

  // Stable ref callback — handles observer attach/detach
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // Clean up previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      sentinelNodeRef.current = node

      if (!node || !hasMore) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore()
          }
        },
        { rootMargin: '50px' }, // Pre-fetch before user reaches the bottom
      )

      observerRef.current.observe(node)
    },
    [hasMore, loadMore],
  )

  // Disconnect observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const resetVisibleCount = useCallback(() => {
    setVisibleCount(batchSize)
  }, [batchSize])

  return { visibleItems, hasMore, sentinelRef, resetVisibleCount }
}
