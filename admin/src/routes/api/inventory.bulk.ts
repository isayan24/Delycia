import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'
import { formatImageToArrayString } from '@/helpers/image/formatImage'
import { BulkInventoryRequest } from '@/helpers/inventory/types'
import { createVariants } from '@/helpers/inventory/variants/operations'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/inventory/bulk')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const data: BulkInventoryRequest = await request.json()
            const { rid, category_id, is_veg, items } = data

            if (!rid || !category_id) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Restaurant ID and category ID are required',
                  error: true,
                },
                400,
              )
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Items array is required and must not be empty',
                  error: true,
                },
                400,
              )
            }

            if (items.length > 100) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Maximum 100 items allowed per bulk request',
                  error: true,
                },
                400,
              )
            }

            // Transform items to backend format
            const transformedItems = items.map((item) => ({
              name: item.name,
              description: item.description,
              images: formatImageToArrayString(item.images),
              category_id,
              is_veg,
              price: item.price,
              cost: item.cost,
              stock: item.stock,
              status: 'available',
            }))

            // Call backend bulk-optimized endpoint
            const bulkPayload = {
              rid,
              items: transformedItems,
            }

            const response = await axiosInstance.post(
              '/admin/inventory/bulk',
              bulkPayload,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            )

            // Extract response data
            const inserted = response.data?.inserted
            const failed = response.data?.failed
            const errors = response.data?.errors
            // Determine success message
            let message = 'Bulk operation completed'
            if (inserted > 0 && failed === 0) {
              message = `Successfully added ${inserted} item${inserted > 1 ? 's' : ''}`
            } else if (inserted > 0 && failed > 0) {
              message = `Added ${inserted} item${inserted > 1 ? 's' : ''}, ${failed} failed`
            } else if (failed > 0 && inserted === 0) {
              message = `All ${failed} items failed to add`
            }

            // Process variants for successfully inserted items
            if (inserted > 0 && items && items.length > 0) {
              const firstId = response.data?.first_id

              if (firstId) {
                const variantPromises = []

                const countToProcess = Math.min(items.length, inserted)

                for (let i = 0; i < countToProcess; i++) {
                  const currentId = firstId + i
                  const originalItem = items[i]

                  if (
                    originalItem &&
                    originalItem.variants &&
                    originalItem.variants.length > 0
                  ) {
                    variantPromises.push(
                      createVariants(
                        currentId,
                        originalItem.variants,
                        accessToken,
                      ),
                    )
                  }
                }

                if (variantPromises.length > 0) {
                  await Promise.allSettled(variantPromises)
                }
              }
            }

            return jsonResponse(
              {
                status: inserted > 0 ? 200 : 400,
                message,
                success: inserted > 0,
                inserted,
                failed,
                errors: failed > 0 ? errors : undefined,
              },
              inserted > 0 ? 200 : 400,
              authHeaders,
            )
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            // For other errors, return a generic error response
            console.error('Error in POST /api/inventory/bulk:', error)
            const errorResponse = handleApiError(error, 'bulk adding items')
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
