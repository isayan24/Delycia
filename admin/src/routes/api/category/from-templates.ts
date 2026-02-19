import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/category/from-templates')({
  server: {
    handlers: {
      // POST - Create categories from existing template IDs (bulk operation)
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()
            const { rid, template_ids } = body

            if (!rid || !template_ids || !Array.isArray(template_ids)) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Restaurant ID and template IDs array are required',
                  error: true,
                },
                400,
              )
            }

            const response = await axiosInstance.post(
              '/categories/bulk-from-templates',
              {
                rid,
                template_ids,
              },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error:any) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            const errorResponse = handleApiError(
              error,
              'Failed to create categories from templates',
            )
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
