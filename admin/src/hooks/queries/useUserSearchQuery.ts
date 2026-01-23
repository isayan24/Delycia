import { useQuery } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

export interface UserSearchResult {
  uid: string
  name: string
  phone_number: string
  username: string
  email?: string
  profile_pic?: string
}

interface UserSearchResponse {
  status: boolean
  users: UserSearchResult[]
}

// ============================================
// Query Key Factory for User Search
// ============================================
export const userSearchKeys = {
  all: ['users', 'search'] as const,
  byTerm: (searchTerm: string) => [...userSearchKeys.all, searchTerm] as const,
}

// ============================================
// Query Hook
// ============================================

/**
 * TanStack Query hook for searching users
 * @param searchTerm - Search term (minimum 2 characters)
 * @param enabled - Whether the query should run
 */
export function useUserSearchQuery(searchTerm: string, enabled = true) {
  return useQuery<UserSearchResponse>({
    queryKey: userSearchKeys.byTerm(searchTerm),
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return { status: false, users: [] }
      }

      const response = await axios.get('/api/users/search', {
        params: { name: searchTerm },
      })
      return response.data
    },
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 30 * 1000, // Results fresh for 30 seconds (user names don't change often)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once for search queries
  })
}
