import { QueryClient, QueryCache } from '@tanstack/react-query'

/**
 * Create QueryClient with production-ready configuration
 *
 * This configuration includes:
 * - Optimized caching and refetching strategies
 * - Global error handling for both queries and mutations
 * - Session error detection for 401 authentication errors
 * - Smart staleTime to prevent excessive refetching
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds by default
        // This prevents excessive refetching on window focus or component remounts
        staleTime: 30 * 1000, // 30 seconds

        // Cache time: how long inactive data stays in cache
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)

        // Retry failed requests with smart logic
        retry: (failureCount: number, error: Error) => {
          // Don't retry on 4xx errors (client errors, including auth failures)
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) return false
          }
          // Retry up to 2 times for other errors (network, 5xx)
          return failureCount < 2
        },
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),

        // Disable refetch on window focus by default
        // Individual queries can override this for real-time data
        refetchOnWindowFocus: false,

        // Don't refetch on mount if data is fresh (within staleTime)
        refetchOnMount: false,

        // Refetch on reconnect to get fresh data after network issues
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,

        // Global error handling for mutations
        onError: (error: Error) => {
          console.error('Mutation error:', error)

          // Also check mutations for 401 errors
          import('@/lib/sessionEventEmitter').then(
            ({ sessionEventEmitter }) => {
              if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any
                if (axiosError.response?.status === 401) {
                  const message =
                    axiosError.response?.data?.message ||
                    'Authentication failed'
                  let errorType:
                    | 'SESSION_EXPIRED'
                    | 'IDLE_TOO_LONG'
                    | 'UNAUTHORIZED' = 'UNAUTHORIZED'

                  if (message.toLowerCase().includes('expired')) {
                    errorType = 'SESSION_EXPIRED'
                  } else if (message.toLowerCase().includes('idle')) {
                    errorType = 'IDLE_TOO_LONG'
                  }

                  sessionEventEmitter.emit({
                    type: errorType,
                    message,
                    timestamp: Date.now(),
                  })
                }
              }
            },
          )
        },
      },
    },
    // Use QueryCache for global query error handling
    queryCache: new QueryCache({
      onError: (error: Error) => {
        // Import session event emitter dynamically to avoid circular deps
        import('@/lib/sessionEventEmitter').then(({ sessionEventEmitter }) => {
          // Handle both axios errors and fetch errors
          const axiosError = error as any

          // Try multiple ways to get the status code
          const status =
            axiosError.response?.status ||
            axiosError.status ||
            (axiosError.message?.includes('401') ? 401 : null)

          if (status === 401) {
            // Determine error type from response message
            const message =
              axiosError.response?.data?.message ||
              axiosError.message ||
              'Authentication failed'

            let errorType:
              | 'SESSION_EXPIRED'
              | 'IDLE_TOO_LONG'
              | 'UNAUTHORIZED' = 'UNAUTHORIZED'

            const lowerMessage = message.toLowerCase()
            if (lowerMessage.includes('expired')) {
              errorType = 'SESSION_EXPIRED'
            } else if (lowerMessage.includes('idle')) {
              errorType = 'IDLE_TOO_LONG'
            } else if (lowerMessage.includes('no session')) {
              errorType = 'SESSION_EXPIRED'
            }

            // Emit session error event
            sessionEventEmitter.emit({
              type: errorType,
              message,
              timestamp: Date.now(),
            })
          }
        })
      },
    }),
  })
}
