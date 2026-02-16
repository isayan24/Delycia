import { QueryClient, QueryCache } from '@tanstack/react-query'

/**
 * Create QueryClient with production-ready configuration for superadmin platform
 *
 * This configuration includes:
 * - Optimized caching and refetching strategies
 * - Global error handling for both queries and mutations
 * - Session error detection for 401 authentication errors
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache time: how long inactive data stays in cache
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)

        // Retry failed requests
        retry: (failureCount: number, error: Error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) return false
          }
          // Retry up to 2 times for other errors
          return failureCount < 2
        },
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus in production for fresh data
        refetchOnWindowFocus: true,

        // Don't refetch on mount if data is fresh
        refetchOnMount: false,

        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,

        // Global error handling for mutations
        onError: (error: Error) => {
          console.error('Mutation error:', error)

          // Check mutations for 401 errors
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any
            if (axiosError.response?.status === 401) {
              const message =
                axiosError.response?.data?.message ||
                'Authentication failed'
              
              // Redirect to login on authentication failure
              window.location.href = '/login'
            }
          }
        },
      },
    },
    // Use QueryCache for global query error handling
    queryCache: new QueryCache({
      onError: (error: Error) => {
        // Handle both axios errors and fetch errors
        const axiosError = error as any

        // Try multiple ways to get the status code
        const status =
          axiosError.response?.status ||
          axiosError.status ||
          (axiosError.message?.includes('401') ? 401 : null)

        if (status === 401) {
          // Redirect to login on authentication failure
          window.location.href = '/login'
        }
      },
    }),
  })
}
