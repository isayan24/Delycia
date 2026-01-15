import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/admin/update')({
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
            password,
            profile_pic,
            phone_number,
          } = body

          if (password) {
            await axiosInstance.patch(
              `/users`,
              { uid, password },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )
          }

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

          if (profile_pic) {
            await axiosInstance.patch(
              `/users`,
              { uid, profile_pic },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )
          }

          return new Response(
            JSON.stringify({ message: 'User updated successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Failed to update user' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
