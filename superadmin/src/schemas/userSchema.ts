import { z } from 'zod'

/**
 * User schema for creating and updating users
 */
export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens',
    )
    .optional()
    .or(z.literal('')),
  country_code: z
    .string()
    .regex(/^\+\d{1,4}$/, 'Invalid country code format')
    .optional()
    .default('+91'),
  phone_number: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  role: z
    .number()
    .int()
    .min(0, 'Role must be a non-negative integer')
    .max(1000, 'Invalid role value')
    .optional()
    .default(0)
    .or(z.string().transform((val) => parseInt(val, 10))),
  restaurant_ids: z
    .array(z.number().int().positive())
    .optional()
    .default([])
    .or(
      z
        .string()
        .transform((val) =>
          val ? val.split(',').map((id) => parseInt(id.trim(), 10)) : [],
        ),
    ),
  profile_pic: z
    .string()
    .url('Invalid profile picture URL')
    .optional()
    .or(z.literal('')),
})

export type UserFormData = z.infer<typeof userSchema>

/**
 * User filter schema for search and filtering
 */
export const userFilterSchema = z.object({
  search: z.string().optional(),
  restaurant_id: z.number().int().positive().optional(),
  role: z.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
})

export type UserFilterData = z.infer<typeof userFilterSchema>

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  user_id: z
    .number()
    .int()
    .positive('User ID is required')
    .or(z.string().transform((val) => parseInt(val, 10))),
})

export type PasswordResetData = z.infer<typeof passwordResetSchema>
