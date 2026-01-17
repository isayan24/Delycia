import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/category/from-templates')({
  server: {
    handlers: {
      // POST - Create categories from existing template IDs (bulk operation)
      POST: async ({ request }) => {
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
        const { rid, template_ids } = body

        if (!rid || !template_ids || !Array.isArray(template_ids)) {
          return new Response(
            JSON.stringify({
              status: 400,
              message: 'Restaurant ID and template IDs array are required',
              error: true,
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          const response = await axiosInstance.post(
            '/categories/bulk-from-templates',
            {
              rid,
              template_ids,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } },
          )

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Failed to create categories from templates',
          )
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
