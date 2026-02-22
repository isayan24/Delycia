import { z } from 'zod'

// ─────────────────────────────────────────────────────────
// Subscription Plan Schema (matches `subscription_plans` table)
// ─────────────────────────────────────────────────────────

export const subscriptionPlanSchema = z.object({
  plan_code: z
    .string()
    .min(1, 'Plan code is required')
    .max(50, 'Plan code must be less than 50 characters'),
  plan_name: z
    .string()
    .min(1, 'Plan name is required')
    .max(100, 'Plan name must be less than 100 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  currency: z.string().max(3).optional().default('INR'),
  billing_period: z.enum(['month', 'year', 'trial'], {
    errorMap: () => ({ message: 'Must be month, year, or trial' }),
  }),
  billing_days: z
    .number()
    .int()
    .positive('Billing days must be a positive integer'),
  savings: z.number().min(0).optional().default(0),
  is_popular: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  display_order: z.number().int().min(0).optional().default(0),
  features: z
    .array(z.string().min(1))
    .min(1, 'At least one feature is required'),
  max_restaurants: z.number().int().positive().optional().default(1),
})

export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>

// ─────────────────────────────────────────────────────────
// Subscription Assignment Schema (matches `subscriptions` table)
// ─────────────────────────────────────────────────────────

export const subscriptionAssignmentSchema = z
  .object({
    restaurant_id: z.number().int().positive('Restaurant is required'),
    subscription_plan_id: z
      .number()
      .int()
      .positive('Subscription plan is required'),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .refine((d) => !isNaN(new Date(d).getTime()), {
        message: 'Invalid start date',
      }),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .refine((d) => !isNaN(new Date(d).getTime()), {
        message: 'Invalid end date',
      }),
    auto_renew: z.boolean().optional().default(true),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
  })

export type SubscriptionAssignmentFormData = z.infer<
  typeof subscriptionAssignmentSchema
>
