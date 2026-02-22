import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'
import { withAuth, jsonResponse } from '../withAuth'
import { restaurantSchema } from '@/schemas/restaurantSchema'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface Restaurant {
  id: number
  name: string
  username?: string | null
  email?: string | null
  phone_number?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null
  is_active: number // 1 = active, 0 = inactive
  description?: string | null
  subscription_plan_name?: string | null
  subscription_assignment_id?: number | null
  subscription_status?: string | null
  created_at: string
  updated_at: string
}

export interface RestaurantFilters {
  search?: string
  status?: string // 'active' | 'inactive' | '' (empty = all)
  subscriptionPlanId?: number[]
  page?: number
  limit?: number
}

// ─────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────

const restaurantFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(), // single string: 'active' | 'inactive' | ''
  subscriptionPlanId: z.array(z.number()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
})

const restaurantIdSchema = z.object({
  id: z.number().int().positive(),
})

// ─────────────────────────────────────────────────────────
// Server Functions
// ─────────────────────────────────────────────────────────

/**
 * Get all restaurants with optional filters
 * GET /api/v1/superadmin/restaurants
 */
export const getRestaurants = createServerFn({ method: 'GET' })
  .inputValidator((data: RestaurantFilters) =>
    restaurantFiltersSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        // Build query parameters
        const params = new URLSearchParams()
        if (data.search) params.append('search', data.search)
        if (data.status) params.append('status', data.status) // single string filter
        if (data.subscriptionPlanId?.length) {
          data.subscriptionPlanId.forEach((id) =>
            params.append('subscriptionPlanId', id.toString()),
          )
        }
        if (data.page) params.append('page', data.page.toString())
        if (data.limit) params.append('limit', data.limit.toString())

        const queryString = params.toString()
        const url = `/superadmin/restaurants${queryString ? `?${queryString}` : ''}`

        const response = await axios.get(url)

        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch restaurants:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to fetch restaurants',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Get a single restaurant by ID
 * GET /api/v1/superadmin/restaurants/:id
 */
export const getRestaurant = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => restaurantIdSchema.parse(data))
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.get(`/superadmin/restaurants/${data.id}`)
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch restaurant:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to fetch restaurant',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Create a new restaurant
 * POST /api/v1/superadmin/restaurants
 */
export const createRestaurant = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof restaurantSchema>) =>
    restaurantSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.post('/superadmin/restaurants', data)
        return jsonResponse(response.data, 201, headers)
      } catch (error: any) {
        console.error('Failed to create restaurant:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to create restaurant',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Update an existing restaurant
 * PATCH /api/v1/superadmin/restaurants/:id
 */
export const updateRestaurant = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { id: number } & Partial<z.infer<typeof restaurantSchema>>) => {
      const { id, ...restaurantData } = data
      restaurantIdSchema.parse({ id })
      restaurantSchema.partial().parse(restaurantData)
      return data
    },
  )
  .handler(async ({ data }) => {
    const { id, ...updateData } = data

    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.patch(
          `/superadmin/restaurants/${id}`,
          updateData,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to update restaurant:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to update restaurant',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Deactivate a restaurant (soft delete)
 * DELETE /api/v1/superadmin/restaurants/:id
 */
export const deactivateRestaurant = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => restaurantIdSchema.parse(data))
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.delete(
          `/superadmin/restaurants/${data.id}`,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to deactivate restaurant:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to deactivate restaurant',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })
