import { z } from 'zod'

/**
 * Staff schema for creating and updating staff members
 */
export const staffSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone_number: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits')
    .optional()
    .or(z.literal('')),
  role: z
    .number()
    .int()
    .min(2, 'Role must be at least 2 (Admin)')
    .max(7, 'Role must be at most 7 (Delivery)')
    .optional()
    .default(5)
    .or(z.string().transform((val) => parseInt(val, 10))),
  restaurant_id: z
    .number()
    .int()
    .positive('Restaurant is required')
    .or(z.string().transform((val) => parseInt(val, 10))),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  username: z.string().optional(),
})

export type StaffFormData = z.infer<typeof staffSchema>

/**
 * Staff filter schema for search and filtering
 */
export const staffFilterSchema = z.object({
  search: z.string().optional(),
  restaurant_id: z.number().int().positive().optional(),
  role: z.number().int().min(10).max(100).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
})

export type StaffFilterData = z.infer<typeof staffFilterSchema>
