import { z } from 'zod'

/**
 * Login schema for superadmin authentication
 * Supports email/username with password and optional remember me
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      (val) => {
        // Check if it's an email or username
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        const isUsername = /^[a-zA-Z0-9_-]{3,20}$/.test(val)
        return isEmail || isUsername
      },
      {
        message: 'Must be a valid email or username',
      },
    ),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export type LoginFormData = z.infer<typeof loginSchema>
