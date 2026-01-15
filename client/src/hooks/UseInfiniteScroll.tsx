import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'framer-motion';

interface UseInfiniteScrollProps<T> {
  allData: T[];
  itemsPerPage?: number;
  threshold?: number;
}

export function useInfiniteScroll<T>({ 
  allData, 
  itemsPerPage = 20, 
  threshold = 0.1 
}: UseInfiniteScrollProps<T>) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const triggerRef = useRef(null);
  const isInView = useInView(triggerRef, { margin: `${threshold * 100}%` });

  console.log(isInView, "In VIew"); 
  
  // Reset when allData changes
  useEffect(() => {
    if (allData.length === 0) {
      setDisplayedItems([]);
      setHasMore(false);
      setPage(1);
      return;
    }

    const firstPage = allData.slice(0, itemsPerPage);
    setDisplayedItems(firstPage);
    setHasMore(allData.length > itemsPerPage);
    setPage(1);
    setIsLoading(false);
  }, [allData, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore || allData.length === 0) return;
    
    setIsLoading(true);
    
    // Simulate slight delay to prevent rapid firing
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const nextItems = allData.slice(startIndex, endIndex);
      
      if (nextItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...nextItems]);
        setPage(nextPage);
        setHasMore(endIndex < allData.length);
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 100);
  }, [allData, page, itemsPerPage, hasMore, isLoading]);

  // Load more when trigger is in view
  useEffect(() => {
    if (isInView && !isLoading) {
      loadMore();
    }
  }, [isInView, loadMore, isLoading]);

  return {
    displayedItems,
    hasMore,
    triggerRef,
    totalItems: allData.length,
    isLoading
  };
}