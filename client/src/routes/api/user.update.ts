import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

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
            profile_pic,
            // phone_number,
          } = body

          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            console.error('[API /api/user/update] No access token found')
            return Response.json(
              { error: 'Unauthorized - No access token' },
              { status: 401 },
            )
          }

          if (username || name) {
            const response = await axiosInstance.patch(
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
            { 
              success: true,
              message: 'User updated successfully',
              data: { uid, username, name, profile_pic }
            },
            { status: 200 },
          )
        } catch (error: any) {
          console.error('[API /api/user/update] Error:', error.response?.data || error.message)
          return Response.json(
            { 
              success: false,
              error: 'Failed to update user',
              message: error.response?.data?.message || error.message 
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
