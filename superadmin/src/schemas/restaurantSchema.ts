import { z } from 'zod'

/**
 * Base restaurant schema fields
 */
const baseRestaurantFields = {
  name: z
    .string()
    .min(1, 'Restaurant name is required')
    .max(100, 'Restaurant name must be less than 100 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens',
    ),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone_number: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(100, 'Country must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  postal_code: z
    .string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional()
    .or(z.literal('')),
}

/**
 * Schema for creating a new restaurant
 */
export const createRestaurantSchema = z.object(baseRestaurantFields)

/**
 * Schema for updating an existing restaurant
 */
export const updateRestaurantSchema = z.object({
  ...baseRestaurantFields,
  is_active: z.boolean().optional(),
})

/**
 * General restaurant schema (for forms)
 */
export const restaurantSchema = createRestaurantSchema

export type RestaurantFormData = z.infer<typeof createRestaurantSchema>

/**
 * Restaurant filter schema for search and filtering
 */
export const restaurantFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  subscription_plan_id: z.number().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
})

export type RestaurantFilterData = z.infer<typeof restaurantFilterSchema>
