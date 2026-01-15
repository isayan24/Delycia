import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { createCategory, updateCategory, deleteCategory } from '../api/category'
import { queryKeys } from './queryKeys'

// Category Mutations
export const useCategoryMutations = () => {
  const queryClient = useQueryClient()

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      img: string
      token: string
      rid: string
    }) => createCategory({ data }),
    onSuccess: () => {
      // Invalidate categories list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      img: string
      categoryId: string
      token: string
      is_active?: boolean
      rid: string
    }) => updateCategory({ data }),
    onSuccess: (_, variables) => {
      // Invalidate specific category and list
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(variables.categoryId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (data: {
      img?: string
      token: string
      id: string
      rid: string
      template_id?: string
    }) => deleteCategory({ data }),
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  }
}
