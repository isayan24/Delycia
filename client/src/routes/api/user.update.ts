import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/user/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const body = await request.json()
            const {
              uid,
              username,
              name,
              profile_pic,
              // phone_number,
            } = body

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
            
            return jsonResponse(
              { 
                success: true,
                message: 'User updated successfully',
                data: { uid, username, name, profile_pic }
              },
              200,
              authHeaders,
            )
          } catch (error: any) {
            console.error('[API /api/user/update] Error:', error.response?.data || error.message)
            return jsonResponse(
              { 
                success: false,
                error: 'Failed to update user',
                message: error.response?.data?.message || error.message 
              },
              500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
