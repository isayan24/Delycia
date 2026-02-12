import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/categories')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(
          request,
          async (accessToken, authHeaders) => {
            try {
              const url = new URL(request.url)
              const endpoint = `/categories${url.search}`

              // If no accessToken, we still make the request but without the header
              // The backend should handle public access if configured
              const headers: Record<string, string> = {}
              if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`
              }

              const response = await axiosInstance.get(endpoint, {
                headers,
              })
              // console.log(response, "i have the response \n\n\n\n")
              return jsonResponse(response.data, 200, authHeaders)
            } catch (error: any) {
              console.error('Error fetching categories:', error)
              return jsonResponse(
                { error: 'Failed to fetch categories' },
                500,
                authHeaders,
              )
            }
          },
          { requireAuth: false },
        )
      },
    },
  },
})
