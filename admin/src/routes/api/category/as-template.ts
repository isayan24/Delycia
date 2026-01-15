import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/category/as-template')({
  server: {
    handlers: {
      // POST - Create category as template
      POST: async ({ request }) => {
        const body = await request.json()
        const {
          name,
          description,
          img,
          token,
          rid,
          cuisine_type,
          saveAsTemplate,
        } = body

        if (!token) {
          return new Response(
            JSON.stringify({
              status: 401,
              message: 'Access token is required',
              error: true,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
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
            { headers: { Authorization: `Bearer ${token}` } },
          )

          // Return the created category data
          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Category created as template successfully',
              success: true,
              category: response.data?.category || response.data,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Failed to create category template',
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
