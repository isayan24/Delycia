import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios' // Call local server routes, NOT backend directly!

interface CreateCategoryParams {
  rid: string
  name: string
  description: string
  img?: string
  token: string
}
interface DeleteCategoryParams {
  id: string
  rid: string
  img?: string
  template_id?: string
  token: string
}
interface CreateCategoryFromTemplatesParams {
  rid: string
  template_ids: string[]
  token: string
}

interface CreateCategoryAsTemplateParams {
  name: string
  description?: string
  img: string
  rid: string
  cuisine_type: string
  saveAsTemplate: boolean
  token: string
}

interface UpdateCategoryParams {
  id: string
  rid: string
  name?: string
  description?: string
  img?: string
  is_active?: boolean
  token: string
}

// ============================================
// Query Key Factory for Categories
// ============================================
export const categoryKeys = {
  all: ['categories'] as const,
  byRestaurant: (rid: string | number) =>
    [...categoryKeys.all, 'restaurant', String(rid)] as const, // ALWAYS use string
  templates: {
    all: ['category-templates'] as const,
    cuisineTypes: ['category-templates', 'cuisine-types'] as const,
    byCuisine: (cuisineType: string) =>
      [...categoryKeys.templates.all, 'cuisine', cuisineType] as const,
  },
}

// ============================================
// Query Hooks
// ============================================

export function useCategoriesQuery(rid: string | undefined, enabled = true) {
  const queryKey = categoryKeys.byRestaurant(rid ?? '')

  return useQuery({
    queryKey, // ✅ MUST use the computed key, NOT hardcoded!
    queryFn: async () => {
      if (!rid) throw new Error('Restaurant ID is required')
      const response = await axios.get('/api/category', {
        params: { rid },
      })
      return response.data
    },
    enabled: enabled && !!rid,
    retry: 2,
    staleTime: 30 * 60 * 1000, // Templates rarely change, fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  })
}

const categoryCall = async (data: CreateCategoryParams) => {
  const { token, img, name, description, rid } = data

  if (!rid || !token) {
    throw new Error('Restaurant ID and token are required')
  }
  const response = await axios.post('/api/category', {
    img,
    name,
    description,
    rid,
    token,
  })
  return response.data
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCategoryParams) => categoryCall(data),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: categoryKeys.byRestaurant(String(variables.rid)),
        refetchType: 'active',
      })
    },
  })
}
/**
 * Mutation to update a category
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      rid,
      name,
      description,
      img,
      is_active,
      token,
    }: UpdateCategoryParams) => {
      const response = await axios.patch('/api/category', {
        id,
        rid,
        name,
        description,
        img,
        is_active,
        token,
      })
      return response.data
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: categoryKeys.byRestaurant(String(variables.rid)),
        refetchType: 'active',
      })
    },
  })
}

/**
 * Mutation to delete a category
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      rid,
      img,
      template_id,
      token,
    }: DeleteCategoryParams) => {
      const response = await axios.delete('/api/category', {
        data: { id, rid, img, template_id, token },
      })
      return response.data
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: categoryKeys.byRestaurant(String(variables.rid)),
        refetchType: 'active',
      })
    },
  })
}

/**
 * Fetch all available cuisine types for category templates
 */
export function useCuisineTypesQuery(enabled = true) {
  return useQuery({
    queryKey: categoryKeys.templates.cuisineTypes,
    queryFn: async () => {
      const response = await axios.get('/api/category/cuisine-types')
      return response.data.cuisine_types || []
    },
    enabled,
    staleTime: 30 * 60 * 1000, // Templates rarely change, fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  })
}

/**
 * Fetch category templates for a specific cuisine type
 * @param cuisineType - Type of cuisine
 */
export function useTemplatesByCuisineQuery(
  cuisineType: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: categoryKeys.templates.byCuisine(cuisineType ?? ''),
    queryFn: async () => {
      if (!cuisineType) throw new Error('Cuisine type is required')
      const response = await axios.get(`/api/category/templates/${cuisineType}`)
      return response.data.templates || []
    },
    enabled: enabled && !!cuisineType,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Mutation to create categories from templates in bulk
 */
export function useCreateCategoriesFromTemplatesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateCategoryFromTemplatesParams) => {
      const { token, ...data } = params

      const response = await axios.post('/api/category/from-templates', {
        data,
        token,
      })
      return response.data
    },
    onSuccess: (_data, variables) => {
      // Invalidate categories for this restaurant to trigger refetch
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byRestaurant(variables.rid),
      })
    },
  })
}
/**
 * Mutation to create a new category as a template
 */
export function useCreateCategoryAsTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCategoryAsTemplateParams) => {
      const response = await axios.post('/api/category/as-template', data)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.byRestaurant(String(variables.rid)),
      })
    },
  })
}
