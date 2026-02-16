import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
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
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  contact_email: string
  contact_phone: string
  website?: string
  description?: string
  logo_url?: string
  status: 'active' | 'inactive' | 'suspended'
  subscription_plan_id: number | null
  subscription_plan_name: string | null
  created_at: string
  updated_at: string
}

export interface RestaurantFilters {
  search?: string
  status?: string[]
  subscriptionPlanId?: number[]
  page?: number
  limit?: number
}

// ─────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────

const restaurantFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.string()).optional(),
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
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        // Build query parameters
        const params = new URLSearchParams()
        if (data.search) params.append('search', data.search)
        if (data.status?.length) {
          data.status.forEach((s) => params.append('status', s))
        }
        if (data.subscriptionPlanId?.length) {
          data.subscriptionPlanId.forEach((id) =>
            params.append('subscriptionPlanId', id.toString()),
          )
        }
        if (data.page) params.append('page', data.page.toString())
        if (data.limit) params.append('limit', data.limit.toString())

        const queryString = params.toString()
        const url = `/v1/superadmin/restaurants${queryString ? `?${queryString}` : ''}`

        const response = await axiosInstance.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch restaurants:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to fetch restaurants',
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
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.get(
          `/v1/superadmin/restaurants/${data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

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
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.post(
          '/v1/superadmin/restaurants',
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )

        return jsonResponse(response.data, 201, headers)
      } catch (error: any) {
        console.error('Failed to create restaurant:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to create restaurant',
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
  .inputValidator((data: { id: number } & Partial<z.infer<typeof restaurantSchema>>) => {
    const { id, ...restaurantData } = data
    restaurantIdSchema.parse({ id })
    restaurantSchema.partial().parse(restaurantData)
    return data
  })
  .handler(async ({ data }) => {
    const request = await getRequest()
    const { id, ...updateData } = data

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.patch(
          `/v1/superadmin/restaurants/${id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )

        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to update restaurant:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to update restaurant',
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
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.delete(
          `/v1/superadmin/restaurants/${data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
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
