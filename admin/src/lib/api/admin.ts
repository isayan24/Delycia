import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import axiosInstance from '../axios'

// Validation schema
const updateAdminSchema = z.object({
  uid: z.string(),
  username: z.string().optional(),
  name: z.string().optional(),
  password: z.string().optional(),
  profile_pic: z.string().optional(),
  phone_number: z.string().optional(),
  accessToken: z.string(),
})

// Server Function
export const updateAdminProfile = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof updateAdminSchema> }) => {
  const validated = updateAdminSchema.parse(data)
  const {
    uid,
    username,
    name,
    password,
    profile_pic,
    phone_number,
    accessToken,
  } = validated

  try {
    // Update password if provided
    if (password) {
      await axiosInstance.patch(
        `/users`,
        { uid, password },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
    }

    // Update username/name if provided
    if (username || name) {
      await axiosInstance.patch(
        `/users`,
        {
          uid,
          username,
          name,
          phone_number,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
    }

    // Update profile picture if provided
    if (profile_pic) {
      await axiosInstance.patch(
        `/users`,
        { uid, profile_pic },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
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
