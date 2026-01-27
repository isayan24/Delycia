import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/user/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const {
            uid,
            username,
            name,
            accessToken,
            profile_pic,
            // phone_number,
          } = body

          if (username || name) {
            await axiosInstance.patch(
              `/users`,
              {
                uid,
                username,
                name,
                // phone_number,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            )
          }

          if (profile_pic) {
            await axiosInstance.patch(
              `/users`,
              { uid, profile_pic },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )
          }
          return Response.json(
            { message: 'User updated successfully' },
            { status: 200 },
          )
        } catch (error) {
          return Response.json(
            { error: 'Failed to update user' },
            { status: 500 },
          )
        }
      },
    },
  },
})
