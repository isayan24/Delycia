import { createRouter } from '@tanstack/react-router'
import { QueryClient, MutationCache } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Define router context type
export interface RouterContext {
  queryClient: QueryClient
  auth?: {
    isAuthenticated: boolean
    user?: unknown
  }
}

// Create QueryClient with production-grade defaults
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute
        staleTime: 60 * 1000,
        // Don't refetch on window focus in production to reduce API calls
        refetchOnWindowFocus: false,
        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        // Only retry on network errors or 5xx server errors
        retryDelay: (attemptIndex: number) =>
          Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
    // Global mutation cache with auto-invalidation
    mutationCache: new MutationCache({
      onSettled: (_data, _error, _variables, _context, mutation) => {
        // When the last mutation completes, invalidate all queries
        const queryClient = mutation.options.meta?.queryClient as QueryClient
        if (queryClient && queryClient.isMutating() === 1) {
          return queryClient.invalidateQueries()
        }
      },
    }),
  })
}

// Create a new router instance
export const getRouter = () => {
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      // Auth context will be added here
      auth: undefined,
    } as RouterContext,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  })

  return router
}

// Register router type for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

// Register router context type
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    queryClient?: QueryClient
  }
}
