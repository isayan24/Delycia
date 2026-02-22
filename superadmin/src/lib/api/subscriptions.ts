import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { withAuth, jsonResponse } from '../withAuth'

// ─────────────────────────────────────────────────────────
// Types (match actual DB schema)
// ─────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: number
  plan_code: string
  plan_name: string
  price: number
  currency: string
  billing_period: 'month' | 'year' | 'trial'
  billing_days: number
  savings: number
  is_popular: number // tinyint
  is_active: number // tinyint
  display_order: number
  features: string // JSON string — parsed on frontend
  max_restaurants: number
  created_at: string
  updated_at: string
  // Joined stats from getAllPlans query
  active_subscriptions?: number
  total_restaurants?: number
}

export interface Subscription {
  id: number
  restaurant_id: number
  plan_id: number
  plan_type: 'trial' | 'monthly' | 'annual'
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  amount: number
  currency: string
  auto_renew: number // tinyint
  cancelled_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  plan_name?: string
  plan_code?: string
  restaurant_name?: string
  billing_period?: string
  price?: number
}

// ─────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────

const planIdSchema = z.object({
  id: z.number().int().positive(),
})

// ─────────────────────────────────────────────────────────
// Plan Server Functions
// ─────────────────────────────────────────────────────────

/**
 * Get all subscription plans
 * GET /superadmin/subscriptions/plans
 */
export const getSubscriptionPlans = createServerFn({ method: 'GET' }).handler(
  async () => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.get(
          '/superadmin/subscriptions/plans?include_inactive=true',
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch subscription plans:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error ||
              'Failed to fetch subscription plans',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  },
)

/**
 * Get single plan by ID
 * GET /superadmin/subscriptions/plans/:id
 */
export const getPlanById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => planIdSchema.parse(data))
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.get(
          `/superadmin/subscriptions/plans/${data.id}`,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch plan:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to fetch plan',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Get usage statistics for a specific plan
 * GET /superadmin/subscriptions/plans/:id/stats
 */
export const getPlanStats = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => planIdSchema.parse(data))
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.get(
          `/superadmin/subscriptions/plans/${data.id}/stats`,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch plan stats:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to fetch plan stats',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Create a new subscription plan
 * POST /superadmin/subscriptions/plans
 */
export const createPlan = createServerFn({ method: 'POST' })
  .inputValidator((data: any) =>
    z
      .object({
        plan_code: z.string().min(1),
        plan_name: z.string().min(1),
        price: z.number().min(0),
        currency: z.string().max(3).optional(),
        billing_period: z.enum(['month', 'year', 'trial']),
        billing_days: z.number().int().positive(),
        savings: z.number().min(0).optional(),
        is_popular: z.boolean().optional(),
        display_order: z.number().int().min(0).optional(),
        features: z.array(z.string().min(1)).min(1),
        max_restaurants: z.number().int().positive().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.post('/superadmin/subscriptions/plans', {
          ...data,
          // Backend expects is_popular as 0/1
          is_popular: data.is_popular ? 1 : 0,
        })
        return jsonResponse(response.data, 201, headers)
      } catch (error: any) {
        console.error('Failed to create plan:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to create plan',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Update an existing subscription plan
 * PATCH /superadmin/subscriptions/plans/:id
 */
export const updatePlan = createServerFn({ method: 'POST' })
  .inputValidator((data: any) =>
    z
      .object({
        id: z.number().int().positive(),
        plan_code: z.string().min(1).optional(),
        plan_name: z.string().min(1).optional(),
        price: z.number().min(0).optional(),
        currency: z.string().max(3).optional(),
        billing_period: z.enum(['month', 'year', 'trial']).optional(),
        billing_days: z.number().int().positive().optional(),
        savings: z.number().min(0).optional(),
        is_popular: z.boolean().optional(),
        is_active: z.boolean().optional(),
        display_order: z.number().int().min(0).optional(),
        features: z.array(z.string().min(1)).min(1).optional(),
        max_restaurants: z.number().int().positive().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { id, ...updateData } = data

    console.log(data, 'the data i am providing \n\n\n\n')

    // Convert booleans to 0/1 for tinyint columns
    const payload: any = { ...updateData }
    if (payload.is_popular !== undefined)
      payload.is_popular = payload.is_popular ? 1 : 0
    if (payload.is_active !== undefined)
      payload.is_active = payload.is_active ? 1 : 0

    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.patch(
          `/superadmin/subscriptions/plans/${id}`,
          payload,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to update plan:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to update plan',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Deactivate a subscription plan
 * DELETE /superadmin/subscriptions/plans/:id
 */
export const deactivatePlan = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => planIdSchema.parse(data))
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.delete(
          `/superadmin/subscriptions/plans/${data.id}`,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to deactivate plan:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to deactivate plan',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

// ─────────────────────────────────────────────────────────
// Assignment Server Functions
// ─────────────────────────────────────────────────────────

/**
 * Assign a subscription plan to a restaurant
 * POST /superadmin/subscriptions/assignments
 */
export const assignSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: any) =>
    z
      .object({
        restaurant_id: z.number().int().positive(),
        subscription_plan_id: z.number().int().positive(),
        start_date: z.string(),
        end_date: z.string(),
        auto_renew: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.post(
          '/superadmin/subscriptions/assignments',
          data,
        )
        return jsonResponse(response.data, 201, headers)
      } catch (error: any) {
        console.error('Failed to assign subscription:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to assign subscription',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Get restaurant's current subscription
 * GET /superadmin/subscriptions/assignments/:restaurantId
 */
export const getRestaurantSubscription = createServerFn({ method: 'GET' })
  .inputValidator((data: { restaurantId: number }) =>
    z.object({ restaurantId: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.get(
          `/superadmin/subscriptions/assignments/${data.restaurantId}`,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch restaurant subscription:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error ||
              'Failed to fetch restaurant subscription',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Change a restaurant's subscription plan
 * PATCH /superadmin/subscriptions/assignments/:id
 */
export const changeSubscriptionPlan = createServerFn({ method: 'POST' })
  .inputValidator((data: any) =>
    z
      .object({
        id: z.number().int().positive(),
        subscription_plan_id: z.number().int().positive().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
        auto_renew: z.boolean().optional(),
        status: z.enum(['active', 'expired', 'cancelled']).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.patch(
          `/superadmin/subscriptions/assignments/${id}`,
          updateData,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to change subscription plan:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error ||
              'Failed to change subscription plan',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Get subscription history for a restaurant
 * GET /superadmin/subscriptions/assignments/:restaurantId/history
 */
export const getSubscriptionHistory = createServerFn({ method: 'GET' })
  .inputValidator((data: { restaurantId: number }) =>
    z.object({ restaurantId: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    return withAuth(async (axios, headers) => {
      try {
        const response = await axios.get(
          `/superadmin/subscriptions/assignments/${data.restaurantId}/history`,
        )
        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch subscription history:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error ||
              'Failed to fetch subscription history',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })
