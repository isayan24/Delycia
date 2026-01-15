import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTable, deleteTable } from '../api/table'
import { queryKeys } from './queryKeys'

// Table Mutations
export const useTableMutations = () => {
  const queryClient = useQueryClient()

  // Create table mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      rid: string
      table_number: string
      capacity: number
      zone: string
      accessToken: string
    }) => createTable({ data }),
    onSuccess: (_, variables) => {
      // Invalidate tables list for this restaurant
      queryClient.invalidateQueries({
        queryKey: queryKeys.tables.list(variables.rid),
      })
    },
  })

  // Delete table mutation
  const deleteMutation = useMutation({
    mutationFn: (data: { id: string; accessToken: string }) =>
      deleteTable({ data }),
    onSuccess: () => {
      // Invalidate all tables lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all })
    },
  })

  return {
    create: createMutation,
    delete: deleteMutation,
  }
}
