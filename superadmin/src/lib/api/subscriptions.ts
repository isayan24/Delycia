import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import axiosInstance from '../axios'
import { withAuth, jsonResponse } from '../withAuth'

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: number
  billing_cycle: 'monthly' | 'quarterly' | 'annual'
  max_menu_items: number
  max_staff_count: number
  max_monthly_orders: number
  custom_branding: boolean
  analytics_access: boolean
  api_access: boolean
  priority_support: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlanStats {
  plan_id: number
  active_subscriptions: number
  total_restaurants: number
}

export interface SubscriptionAssignment {
  id: number
  restaurant_id: number
  subscription_plan_id: number
  start_date: string
  end_date: string | null
  status: 'active' | 'expired' | 'cancelled'
  auto_renew: boolean
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────

const planIdSchema = z.object({
  id: z.number().int().positive(),
})

// ─────────────────────────────────────────────────────────
// Server Functions
// ─────────────────────────────────────────────────────────

/**
 * Get all subscription plans
 * GET /api/v1/superadmin/subscriptions/plans
 */
export const getSubscriptionPlans = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.get(
          '/v1/superadmin/subscriptions/plans',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
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
 * Get usage statistics for a specific plan
 * GET /api/v1/superadmin/subscriptions/plans/:id/stats
 */
export const getPlanStats = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => planIdSchema.parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.get(
          `/v1/superadmin/subscriptions/plans/${data.id}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch plan stats:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to fetch plan stats',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Create a new subscription plan
 * POST /api/v1/superadmin/subscriptions/plans
 */
export const createPlan = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => z.object({
    plan_name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    billing_period: z.enum(['monthly', 'quarterly', 'annual']),
    max_menu_items: z.number().optional(),
    max_staff: z.number().optional(),
    max_monthly_orders: z.number().optional(),
    custom_branding: z.boolean().optional(),
    analytics_access: z.boolean().optional(),
    api_access: z.boolean().optional(),
    priority_support: z.boolean().optional(),
    is_active: z.boolean().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.post(
          '/v1/superadmin/subscriptions/plans',
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
 * PATCH /api/v1/superadmin/subscriptions/plans/:id
 */
export const updatePlan = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => z.object({
    id: z.number().int().positive(),
    plan_name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    billing_period: z.enum(['monthly', 'quarterly', 'annual']).optional(),
    max_menu_items: z.number().optional(),
    max_staff: z.number().optional(),
    max_monthly_orders: z.number().optional(),
    custom_branding: z.boolean().optional(),
    analytics_access: z.boolean().optional(),
    api_access: z.boolean().optional(),
    priority_support: z.boolean().optional(),
    is_active: z.boolean().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()
    const { id, ...updateData } = data

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.patch(
          `/v1/superadmin/subscriptions/plans/${id}`,
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
 * DELETE /api/v1/superadmin/subscriptions/plans/:id
 */
export const deactivatePlan = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => planIdSchema.parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.delete(
          `/v1/superadmin/subscriptions/plans/${data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
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

/**
 * Assign a subscription plan to a restaurant
 * POST /api/v1/superadmin/subscriptions/assignments
 */
export const assignSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => z.object({
    restaurant_id: z.number().int().positive(),
    subscription_plan_id: z.number().int().positive(),
    start_date: z.string(),
    end_date: z.string(),
    auto_renew: z.boolean().optional(),
    status: z.enum(['active', 'expired', 'cancelled']).optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.post(
          '/v1/superadmin/subscriptions/assignments',
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
        console.error('Failed to assign subscription:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to assign subscription',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Get restaurant's current subscription
 * GET /api/v1/superadmin/subscriptions/assignments/:restaurantId
 */
export const getRestaurantSubscription = createServerFn({ method: 'GET' })
  .inputValidator((data: { restaurantId: number }) => z.object({
    restaurantId: z.number().int().positive(),
  }).parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.get(
          `/v1/superadmin/subscriptions/assignments/${data.restaurantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch restaurant subscription:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to fetch restaurant subscription',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Change a restaurant's subscription plan
 * PATCH /api/v1/superadmin/subscriptions/assignments/:id
 */
export const changeSubscriptionPlan = createServerFn({ method: 'POST' })
  .inputValidator((data: any) => z.object({
    id: z.number().int().positive(),
    subscription_plan_id: z.number().int().positive().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    auto_renew: z.boolean().optional(),
    status: z.enum(['active', 'expired', 'cancelled']).optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()
    const { id, ...updateData } = data

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.patch(
          `/v1/superadmin/subscriptions/assignments/${id}`,
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
        console.error('Failed to change subscription plan:', error)
        return jsonResponse(
          {
            status: false,
            error: error?.response?.data?.error || 'Failed to change subscription plan',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })

/**
 * Get subscription history for a restaurant
 * GET /api/v1/superadmin/subscriptions/assignments/:restaurantId/history
 */
export const getSubscriptionHistory = createServerFn({ method: 'GET' })
  .inputValidator((data: { restaurantId: number }) => z.object({
    restaurantId: z.number().int().positive(),
  }).parse(data))
  .handler(async ({ data }) => {
    const request = await getRequest()

    return withAuth(request, async (token, headers) => {
      try {
        const response = await axiosInstance.get(
          `/v1/superadmin/subscriptions/assignments/${data.restaurantId}/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        return jsonResponse(response.data, 200, headers)
      } catch (error: any) {
        console.error('Failed to fetch subscription history:', error)
        return jsonResponse(
          {
            status: false,
            error:
              error?.response?.data?.error || 'Failed to fetch subscription history',
          },
          error?.response?.status || 500,
          headers,
        )
      }
    })
  })
