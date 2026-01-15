// Central export for all query patterns
export { queryKeys } from './queryKeys'
export { restaurantQueries } from './restaurant'
export { useCategoryMutations } from './categories'
export { useOrderMutations } from './orders'
export { useTableMutations } from './tables'

// Re-export common utilities
export {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from '@tanstack/react-query'
