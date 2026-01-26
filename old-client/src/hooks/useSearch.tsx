// Enhanced useSearch with local fuzzy search and performance optimizations
import { useState, useEffect, useCallback, useRef } from "react";
import { useRestaurantId } from "./useRestaurantId";
import { useInventoryItems } from "./useInventoryItems";
import {
  fuzzySearch,
  SearchResult,
  InventoryItem,
} from "@/helpers/fuzzySearch";
import { fetchCategory } from "@/helpers/fetchCategory";

interface SearchCache {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

export const useSearch = () => {
  const rid = useRestaurantId();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Use inventory items hook for local data
  const { allItems, loading: inventoryLoading } = useInventoryItems();

  // Search cache and state management
  const lastQuery = useRef<string>("");
  const searchCache = useRef<Map<string, SearchCache>>(new Map());
  const categoryMap = useRef<Map<string, string>>(new Map());

  // Cache TTL (Time To Live) - 5 minutes
  const CACHE_TTL = 5 * 60 * 1000;

  // Load categories and build category map
  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategory(rid);
      const cats = data.categories || [];
      setCategories(cats);

      // Build category map for quick lookups
      categoryMap.current.clear();
      cats.forEach((cat: any) => {
        categoryMap.current.set(cat.id, cat.name);
      });

      // Clear search cache when categories change
      searchCache.current.clear();
    } catch (err) {
      console.error("Error fetching categories:", {
        error: err,
        component: "useSearch",
      });
      setError("Failed to fetch categories");
    }
  }, [rid]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Check if search cache is valid
  const isCacheValid = useCallback((cacheEntry: SearchCache): boolean => {
    return Date.now() - cacheEntry.timestamp < CACHE_TTL;
  }, [CACHE_TTL]);

  // Clean up old cache entries with LRU-style management
  const cleanupCache = useCallback(() => {
    const now = Date.now();

    // Remove expired entries
    for (const [key, cache] of searchCache.current.entries()) {
      if (now - cache.timestamp > CACHE_TTL) {
        searchCache.current.delete(key);
      }
    }

    // Implement LRU cache with size limit of 100 entries
    if (searchCache.current.size > 100) {
      const entries = Array.from(searchCache.current.entries());
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest 25% of entries to prevent frequent cleanup
      const toRemove = Math.floor(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        searchCache.current.delete(entries[i][0]);
      }
    }
  }, [CACHE_TTL]);

  // Input validation and normalization
  const validateAndNormalizeQuery = (query: string): string | null => {
    if (!query || typeof query !== "string") return null;

    const trimmed = query.trim();
    if (trimmed.length === 0) return null;

    // Handle very long queries
    if (trimmed.length > 100) {
      return trimmed.substring(0, 100);
    }

    return trimmed;
  };

  // Debounced search to prevent excessive processing
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  const performSearch = useCallback(
    (query: string) => {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      const normalizedQuery = validateAndNormalizeQuery(query);
      if (!normalizedQuery) {
        setSearchResults([]);
        lastQuery.current = "";
        return;
      }

      // Avoid duplicate searches
      if (normalizedQuery === lastQuery.current) return;
      lastQuery.current = normalizedQuery;

      // Check search cache first
      const cachedResult = searchCache.current.get(normalizedQuery);
      if (cachedResult && isCacheValid(cachedResult)) {
        setSearchResults(cachedResult.results);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Use requestAnimationFrame to ensure search doesn't block UI
      searchTimeoutRef.current = setTimeout(() => {
        const searchStartTime = performance.now();

        try {
          // Check if inventory data is available
          if (!allItems || allItems.length === 0) {
            setSearchResults([]);
            if (inventoryLoading) {
              setError("Loading menu items...");
            } else {
              setError("No menu items available. Please try again later.");
            }
            setIsLoading(false);
            return;
          }

          // Validate inventory data structure
          const validItems = allItems.filter(
            (item: any) =>
              item &&
              typeof item === "object" &&
              item.id &&
              item.name &&
              typeof item.name === "string"
          );

          if (validItems.length === 0) {
            setSearchResults([]);
            setError("Invalid menu data. Please refresh the page.");
            setIsLoading(false);
            return;
          }

          // Perform local fuzzy search on validated inventory items
          const results = fuzzySearch(
            normalizedQuery,
            validItems as InventoryItem[],
            categoryMap.current
          );

          // Cache the results
          searchCache.current.set(normalizedQuery, {
            query: normalizedQuery,
            results,
            timestamp: Date.now(),
          });

          // Clean up old cache entries periodically (5% chance to reduce overhead)
          if (Math.random() < 0.05) {
            cleanupCache();
          }

          setSearchResults(results);
          setError(null); // Clear any previous errors

          // Performance monitoring
          const searchEndTime = performance.now();
          const searchDuration = searchEndTime - searchStartTime;

          // Log performance warning if search takes too long
          if (searchDuration > 100) {
            console.warn(
              `Search performance warning: ${searchDuration.toFixed(2)}ms for query "${normalizedQuery}" with ${validItems.length} items`
            );
          }
        } catch (err) {
          console.error("Search failed:", err);

          // Provide specific error messages based on error type
          if (err instanceof TypeError) {
            setError("Invalid search data. Please refresh the page.");
          } else if (err instanceof RangeError) {
            setError("Search query too complex. Please try a simpler search.");
          } else {
            setError("Search temporarily unavailable. Please try again.");
          }

          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 0); // Use setTimeout to yield to the event loop
    },
    [allItems, cleanupCache, inventoryLoading, isCacheValid]
  );

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
    lastQuery.current = "";
  }, []);

  const getCategoryForItem = useCallback(
    (itemId: string) => {
      const item: any = allItems.find(
        (item: any) => item.id.toString() === itemId.toString()
      );
      if (
        item &&
        item.category_id &&
        categoryMap.current.has(item.category_id)
      ) {
        return {
          categoryId: item.category_id,
          categoryName: categoryMap.current.get(item.category_id),
        };
      }
      return null;
    },
    [allItems]
  );

  // Clear search cache
  const clearCache = useCallback(() => {
    searchCache.current.clear();
  }, []);

  // Cleanup effect for memory management
  useEffect(() => {
    const currentSearchCache = searchCache.current;
    const currentSearchTimeout = searchTimeoutRef.current;
    
    return () => {
      // Clear timeout on unmount
      if (currentSearchTimeout) {
        clearTimeout(currentSearchTimeout);
      }
      // Clear cache on unmount to free memory
      currentSearchCache.clear();
    };
  }, []);

  // Periodic cache cleanup
  useEffect(() => {
    const interval = setInterval(
      () => {
        cleanupCache();
      },
      5 * 60 * 1000
    ); // Clean up every 5 minutes

    return () => clearInterval(interval);
  }, [cleanupCache]);

  // Performance validation function
  const validatePerformance = useCallback(() => {
    const stats = {
      itemsCount: allItems.length,
      categoriesCount: categories.length,
      searchCacheSize: searchCache.current.size,
      cacheMemoryEstimate: searchCache.current.size * 1024,
      isPerformant: allItems.length < 1000 || searchCache.current.size < 100,
      recommendations: [] as string[],
    };

    if (allItems.length > 1000) {
      stats.recommendations.push(
        "Consider implementing pagination for large inventories"
      );
    }

    if (searchCache.current.size > 100) {
      stats.recommendations.push(
        "Search cache is large, consider more aggressive cleanup"
      );
    }

    return stats;
  }, [allItems.length, categories.length]);

  return {
    searchResults,
    isLoading: isLoading || inventoryLoading,
    error,
    performSearch,
    clearSearch,
    getCategoryForItem,
    isCacheReady: allItems.length > 0 && categories.length > 0,
    clearCache,
    validatePerformance,
    cacheStats: {
      itemsCount: allItems.length,
      categoriesCount: categories.length,
      searchCacheSize: searchCache.current.size,
      cacheMemoryEstimate: searchCache.current.size * 1024, // Rough estimate in bytes
    },
  };
};
