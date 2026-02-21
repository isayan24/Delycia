import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { handleApiError } from '@/helpers/handleApiError'

export const Route = createFileRoute('/api/feature-flags')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const url = new URL(req.url)
            const rid = url.searchParams.get('rid')

            const response = await axiosInstance.get(
              `/admin/features${rid ? `?rid=${rid}` : ''}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            )

            return jsonResponse(
              {
                statusCode: 200,
                message: 'success',
                features: response.data?.features || {},
              },
              200,
              authHeaders,
            )
          } catch (error: any) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error
            }

            const errorResponse = handleApiError(
              error,
              'Error fetching feature flags',
            )
            return jsonResponse(
              {
                statusCode: (errorResponse as any).status || 500,
                message:
                  error.response?.data?.message ||
                  'Failed to fetch feature flags',
                error: true,
              },
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      PATCH: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()

            const response = await axiosInstance.patch(
              '/admin/features',
              body,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              },
            )

            return jsonResponse(
              {
                statusCode: response.data?.statusCode || 200,
                message: response.data?.message || 'Features updated!',
              },
              200,
              authHeaders,
            )
          } catch (error: any) {
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error
            }

            const errorResponse = handleApiError(
              error,
              'Error updating feature flags',
            )
            return jsonResponse(
              {
                statusCode: (errorResponse as any).status || 500,
                message:
                  error.response?.data?.message ||
                  'Failed to update feature flags',
                error: true,
              },
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
