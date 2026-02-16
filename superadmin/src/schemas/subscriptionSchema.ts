import { z } from 'zod'

/**
 * Subscription plan schema for creating and updating plans
 */
export const subscriptionPlanSchema = z.object({
  plan_name: z
    .string()
    .min(1, 'Plan name is required')
    .max(100, 'Plan name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .min(0, 'Price must be a positive number'),
  billing_period: z.enum(['monthly', 'quarterly', 'annual'], {
    errorMap: () => ({ message: 'Invalid billing period' }),
  }),
  max_menu_items: z
    .number()
    .int()
    .min(0, 'Max menu items must be a positive integer')
    .optional(),
  max_staff: z
    .number()
    .int()
    .min(0, 'Max staff must be a positive integer')
    .optional(),
  max_monthly_orders: z
    .number()
    .int()
    .min(0, 'Max monthly orders must be a positive integer')
    .optional(),
  custom_branding: z.boolean().optional().default(false),
  analytics_access: z.boolean().optional().default(false),
  api_access: z.boolean().optional().default(false),
  priority_support: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
})

export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>

/**
 * Subscription assignment schema for assigning plans to restaurants
 */
export const subscriptionAssignmentSchema = z
  .object({
    restaurant_id: z
      .number()
      .int()
      .positive('Restaurant ID is required'),
    subscription_plan_id: z
      .number()
      .int()
      .positive('Subscription plan ID is required'),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .refine(
        (date) => {
          const d = new Date(date)
          return !isNaN(d.getTime())
        },
        { message: 'Invalid start date' },
      ),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .refine(
        (date) => {
          const d = new Date(date)
          return !isNaN(d.getTime())
        },
        { message: 'Invalid end date' },
      ),
    auto_renew: z.boolean().optional().default(false),
    status: z
      .enum(['active', 'expired', 'cancelled'], {
        errorMap: () => ({ message: 'Invalid status' }),
      })
      .optional()
      .default('active'),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return end > start
    },
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    },
  )

export type SubscriptionAssignmentFormData = z.infer<
  typeof subscriptionAssignmentSchema
>

/**
 * Subscription filter schema for search and filtering
 */
export const subscriptionFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  billing_period: z.enum(['monthly', 'quarterly', 'annual', 'all']).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
})

export type SubscriptionFilterData = z.infer<typeof subscriptionFilterSchema>
