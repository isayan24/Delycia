import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/category/as-template')({
  server: {
    handlers: {
      // POST - Create category as template
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const body = await request.json()
            const { name, description, img, rid, cuisine_type, saveAsTemplate } =
              body

            const response = await axiosInstance.post(
              '/category/as-template',
              {
                name,
                description,
                img,
                rid,
                cuisine_type,
                saveAsTemplate,
              },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )

            // Return the created category data
            return jsonResponse(
              {
                status: 200,
                message: 'Category created as template successfully',
                success: true,
                category: response.data?.category || response.data,
              },
              200,
              authHeaders,
            )
          } catch (error:any) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }
            const errorResponse = handleApiError(
              error,
              'Failed to create category template',
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
