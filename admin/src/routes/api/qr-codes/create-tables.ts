import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { withAuth, jsonResponse } from '@/lib/withAuth'

/**
 * BFF API Route: POST /api/qr-codes/create-tables
 * 
 * Simplified endpoint that only creates tables for QR code generation.
 * Does NOT store QR code metadata - QR codes are generated client-side only.
 * 
 * Request Body:
 * {
 *   rid: number,
 *   tables: Array<{
 *     table_number: string,
 *     zone: string
 *   }>
 * }
 * 
 * Response:
 * {
 *   status: number,
 *   message: string,
 *   success: boolean,
 *   createdTables: Array<{ table_number, zone, capacity }>,
 *   createdTablesCount: number,
 *   skippedTables: Array<string>,
 *   skippedTablesCount: number
 * }
 */
export const Route = createFileRoute('/api/qr-codes/create-tables')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
            const body = await req.json()
            const { rid, tables } = body

            // Validate required fields
            if (!rid || !tables || !Array.isArray(tables)) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Missing required fields: rid and tables array',
                  success: false,
                },
                400,
              )
            }

            // Validate tables array structure
            for (const table of tables) {
              if (!table.table_number || !table.zone) {
                return jsonResponse(
                  {
                    status: 400,
                    message: 'Each table must have table_number and zone fields',
                    success: false,
                  },
                  400,
                )
              }
            }

            // Call backend API to create tables
            const response = await axiosInstance.post(
              '/admin/qr-codes/create-tables',
              { rid, tables },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              },
            )

            return jsonResponse(
              {
                status: response.data.status || 200,
                message: response.data.message || 'Tables created successfully',
                success: response.data.success || true,
                createdTables: response.data.createdTables || [],
                createdTablesCount: response.data.createdTablesCount || 0,
                skippedTables: response.data.skippedTables || [],
                skippedTablesCount: response.data.skippedTablesCount || 0,
              },
              response.data.status || 200,
              authHeaders,
            )
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error
            }

            // For other errors, return a generic error response
            const errorResponse = handleApiError(error, 'creating tables')
            return jsonResponse(
              {
                status: (errorResponse as any).status || 500,
                message:
                  error.response?.data?.message || 'Failed to create tables',
                success: false,
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
