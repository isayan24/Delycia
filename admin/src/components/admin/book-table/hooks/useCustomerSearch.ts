import { useDebounce } from '@/hooks/useDebounce'
import {
  useUserSearchQuery,
  type UserSearchResult,
} from '@/hooks/queries/useUserSearchQuery'

export type { UserSearchResult }

/**
 * Hook for customer search with debouncing
 * Wraps useUserSearchQuery with debouncing logic
 * @param searchTerm - Raw search term from input
 */
export function useCustomerSearch(searchTerm: string) {
  // Debounce the search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Use TanStack Query hook for actual data fetching
  const { data, isLoading, error } = useUserSearchQuery(debouncedSearchTerm)

  const clearResults = () => {
    // Note: Results will automatically clear when searchTerm changes
    // This is kept for backward compatibility but is a no-op
    // TanStack Query handles this automatically
  }

  return {
    searchResults: data?.users || [],
    isSearching: isLoading,
    searchError: error ? 'Failed to search users' : null,
    clearResults,
  }
}
