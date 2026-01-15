import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/category/cuisine-types')({
  server: {
    handlers: {
      // GET - Fetch all available cuisine types for templates
      GET: async () => {
        try {
          // Call backend API to get cuisine types
          const response = await axiosInstance.get('/category-templates')

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
            },
          })
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Failed to fetch cuisine types',
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
