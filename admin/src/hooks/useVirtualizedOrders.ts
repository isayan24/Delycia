// import { useRef, useEffect, useCallback } from 'react'
// import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual'

// interface UseVirtualizedOrdersOptions<T> {
//   items: T[]
//   estimateSize?: number
//   overscan?: number
//   onLoadMore?: () => void
//   hasNextPage?: boolean
//   isFetching?: boolean
// }

// interface UseVirtualizedOrdersResult {
//   virtualizer: Virtualizer<HTMLDivElement, Element>
//   virtualItems: ReturnType<Virtualizer<HTMLDivElement, Element>['getVirtualItems']>
//   totalSize: number
//   scrollToTop: () => void
//   parentRef: React.RefObject<HTMLDivElement | null>
// }

// /**
//  * Production-ready virtualization hook for order lists
//  * Uses container scroll with explicit height for stable virtualization
//  * Integrates with TanStack Query infinite scroll
//  * Supports dynamic heights for expandable cards
//  * 
//  * IMPORTANT: The parent container MUST have:
//  * - A fixed height (e.g., calc(100vh - 420px))
//  * - overflow-y-auto for scrolling
//  * - position: relative for absolute positioning of items
//  */
// export function useVirtualizedOrders<T>({
//   items,
//   estimateSize = 180,
//   overscan = 3,
//   onLoadMore,
//   hasNextPage = false,
//   isFetching = false,
// }: UseVirtualizedOrdersOptions<T>): UseVirtualizedOrdersResult {
//   const parentRef = useRef<HTMLDivElement>(null)
//   const lastFetchedLengthRef = useRef(0)

//   // Create virtualizer instance - using container scroll (stable and reliable)
//   const virtualizer = useVirtualizer({
//     count: items.length,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => estimateSize,
//     overscan,
//     // Enable dynamic measurement for expandable cards
//     measureElement:
//       typeof window !== 'undefined' &&
//       navigator.userAgent.indexOf('Firefox') === -1
//         ? (element) => element?.getBoundingClientRect().height
//         : undefined,
//   })

//   const virtualItems = virtualizer.getVirtualItems()

//   // Infinite scroll: trigger load more when scrolling near bottom
//   useEffect(() => {
//     const lastItem = virtualItems[virtualItems.length - 1]

//     if (!lastItem) return

//     // Trigger when last visible item is within 5 items of the end
//     const shouldLoadMore =
//       lastItem.index >= items.length - 5 &&
//       hasNextPage &&
//       !isFetching &&
//       items.length !== lastFetchedLengthRef.current

//     if (shouldLoadMore) {
//       lastFetchedLengthRef.current = items.length
//       onLoadMore?.()
//     }
//   }, [virtualItems, items.length, hasNextPage, isFetching, onLoadMore])

//   // Reset fetch tracker when items shrink (filter/search applied)
//   useEffect(() => {
//     if (items.length < lastFetchedLengthRef.current) {
//       lastFetchedLengthRef.current = 0
//     }
//   }, [items.length])

//   // Scroll to top utility
//   const scrollToTop = useCallback(() => {
//     virtualizer.scrollToIndex(0, {
//       align: 'start',
//       behavior: 'smooth',
//     })
//   }, [virtualizer])

//   return {
//     virtualizer,
//     virtualItems,
//     totalSize: virtualizer.getTotalSize(),
//     scrollToTop,
//     parentRef,
//   }
// }
