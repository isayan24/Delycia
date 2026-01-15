import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'

// Validation schema - removed accessToken since we use httpOnly cookies
const updateAdminSchema = z.object({
  uid: z.string(),
  username: z.string().optional(),
  name: z.string().optional(),
  password: z.string().optional(),
  profile_pic: z.string().optional(),
  phone_number: z.string().optional(),
})

type UpdateAdminData = z.infer<typeof updateAdminSchema>

// Server Function - httpOnly cookies are automatically sent with axiosInstance
export const updateAdminProfile = createServerFn({ method: 'POST' })
  .inputValidator((data: UpdateAdminData) => updateAdminSchema.parse(data))
  .handler(async ({ data }) => {
    const { uid, username, name, password, profile_pic, phone_number } = data

    try {
      // Update password if provided
      // No Authorization header needed - httpOnly cookies are sent automatically
      if (password) {
        await axiosInstance.patch(`/users`, { uid, password })
      }

      // Update username/name if provided
      if (username || name) {
        await axiosInstance.patch(`/users`, {
          uid,
          username,
          name,
          phone_number,
        })
      }

      // Update profile picture if provided
      if (profile_pic) {
        await axiosInstance.patch(`/users`, { uid, profile_pic })
      }

      return {
        status: 200,
        message: 'User updated successfully',
        success: true,
      }
    } catch (error) {
      throw new Error(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  })
