import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/admin/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({
                status: 401,
                message: 'Not authenticated',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const body = await request.json()
          const { uid, username, name, password, profile_pic, phone_number } =
            body

          // Pass Authorization header with token from cookie
          const headers = {
            Authorization: `Bearer ${accessToken}`,
          }

          if (password) {
            await axiosInstance.patch(`/users`, { uid, password }, { headers })
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
              { headers },
            )
          }

          if (profile_pic) {
            await axiosInstance.patch(
              `/users`,
              { uid, profile_pic },
              { headers },
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
