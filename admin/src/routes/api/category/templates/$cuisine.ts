import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/category/templates/$cuisine')({
  server: {
    handlers: {
      // GET - Fetch category templates for a specific cuisine type
      GET: async ({ params }) => {
        const { cuisine } = params

        if (!cuisine) {
          return new Response(
            JSON.stringify({
              status: 400,
              message: 'Cuisine type is required',
              error: true,
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          // Call backend API to get templates for this cuisine
          const response = await axiosInstance.get('/category-templates', {
            params: { cuisine_type: cuisine },
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
            },
          })
        } catch (error:any) {
          if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }
          const errorResponse = handleApiError(
            error,
            'Failed to fetch category templates',
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
