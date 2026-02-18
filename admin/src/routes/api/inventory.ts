import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'
import { imagekit } from '@/lib/imagekit'
import { deleteImagesOneByOne } from '@/helpers/image/formatImage'
import { createPayload } from '@/helpers/inventory/helpers'
import {
  createVariants,
  deleteAllVariants,
  updateVariants,
} from '@/helpers/inventory/variants/operations'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/inventory')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return withAuth(request, async (token, authHeaders) => {
          try {
            const url = new URL(request.url)
            const rid = url.searchParams.get('rid')
            const categoryId = url.searchParams.get('category_id')

            // Prepare params for backend call
            const params: any = {}
            if (rid) params.rid = rid
            if (categoryId) params.category_id = categoryId

            const response = await axiosInstance.get('/inventory', {
              params,
              headers: { Authorization: `Bearer ${token}` },
            })

            return jsonResponse(response.data, 200, authHeaders)
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            // For other errors, return a generic error response
            console.error('Error in GET /api/inventory:', error)
            const errorResponse = handleApiError(error, 'fetching')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      POST: async ({ request }) => {
        return withAuth(request, async (token, authHeaders) => {
          try {
            const data: any = await request.json()
            const { variants } = data

            // For POST, always include images (even if empty array)
            const payload = createPayload(data, true)

            // Create the inventory item
            const inventoryResponse = await axiosInstance.post(
              '/admin/inventory',
              payload,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            )

            // Extract the inventory ID from the response
            const inventoryId =
              inventoryResponse.data?.id ||
              inventoryResponse.data?.data?.id ||
              inventoryResponse.data?.inventory_id

            // If variants exist and we have an inventory ID, create them
            if (variants && variants.length > 0 && inventoryId) {
              await createVariants(inventoryId, variants, token)
            }

            return jsonResponse(
              {
                status: 200,
                message:
                  variants && variants.length > 0
                    ? 'Item and variants added successfully'
                    : 'Item added successfully',
                success: true,
                inventoryId: inventoryId,
                variantCount: variants ? variants.length : 0,
              },
              200,
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
            console.error('Error in POST /api/inventory:', error)
            const errorResponse = handleApiError(error, 'adding')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      PATCH: async ({ request }) => {
        return withAuth(request, async (token, authHeaders) => {
          try {
            const data: any = await request.json()

            const { id, rid, variants, images, selectiveFields, currentStatus } =
              data

            if (!id || !rid) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Item ID and Restaurant ID are required',
                  error: true,
                },
                400,
              )
            }

            // Determine if this is a selective update
            const isSelectiveUpdate =
              selectiveFields && Array.isArray(selectiveFields)

            // Only include images in payload if images are provided and not empty
            const shouldIncludeImages =
              images && Array.isArray(images) && images.length > 0

            // Create payload - use selective fields if provided
            const payload = isSelectiveUpdate
              ? createPayload(
                  data,
                  shouldIncludeImages,
                  selectiveFields,
                  currentStatus,
                )
              : createPayload(data, shouldIncludeImages, undefined, currentStatus)

            // Check if status was auto-updated
            const wasStatusAutoUpdated =
              payload.status === 'available' &&
              data.stock > 0 &&
              !selectiveFields?.includes('status')

            // Only update inventory if there are actual field changes or it's not selective
            const hasInventoryChanges =
              !isSelectiveUpdate ||
              (selectiveFields && selectiveFields.length > 0) ||
              shouldIncludeImages ||
              wasStatusAutoUpdated

            if (hasInventoryChanges) {
              await axiosInstance.patch('/admin/inventory', payload, {
                headers: { Authorization: `Bearer ${token}` },
              })
            }

            // Handle variants if provided (only process if variants are explicitly included)
            const shouldProcessVariants = variants !== undefined

            if (shouldProcessVariants) {
              if (variants.length === 0) {
                // If empty array is passed, delete all variants
                await deleteAllVariants(id, token)
              } else {
                // Update variants (this will handle create, update, and delete operations)
                await updateVariants(id, variants, token)
              }
            }

            // Determine response message based on what was updated
            let message = 'Item updated successfully'

            if (shouldProcessVariants && hasInventoryChanges) {
              message = 'Item and variants updated successfully'
            } else if (shouldProcessVariants) {
              message = 'Variants updated successfully'
            } else if (isSelectiveUpdate && selectiveFields?.length === 1) {
              message = `${selectiveFields[0]} updated successfully`
            }

            // Add status auto-update info to message if it happened
            if (wasStatusAutoUpdated) {
              message += ' (status automatically set to available)'
            }

            return jsonResponse(
              {
                status: 200,
                message,
                success: true,
                variantCount: variants ? variants.length : undefined,
                updatedFields: isSelectiveUpdate ? selectiveFields : undefined,
                isSelectiveUpdate,
                statusAutoUpdated: wasStatusAutoUpdated,
              },
              200,
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
            console.error('Error in PATCH /api/inventory:', error)
            const errorResponse = handleApiError(error, 'updating')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      DELETE: async ({ request }) => {
        return withAuth(request, async (token, authHeaders) => {
          try {
            const data: any = await request.json()
            const { id, img, rid } = data

            if (!id || !rid) {
              return jsonResponse(
                {
                  status: 400,
                  message: 'Item ID and Restaurant ID are required',
                  error: true,
                },
                400,
              )
            }

            try {
              if (img && Array.isArray(img) && img.length > 0) {
                const deletionResults = await deleteImagesOneByOne(img, imagekit)

                // Check if any deletions failed
                const failures = deletionResults.filter(
                  (result: any) => !result.success,
                )
                if (failures.length > 0) {
                  console.warn(
                    `${failures.length} image(s) failed to delete:`,
                    failures,
                  )
                }
              }
            } catch (imageError) {
              console.error('Failed to delete ImageKit images:', imageError)
              // Continue with item deletion even if image deletion fails
            }

            // First delete all associated variants
            await deleteAllVariants(id, token)

            // Then delete the inventory item
            await axiosInstance.delete('/admin/inventory', {
              data: { id, rid },
              headers: { Authorization: `Bearer ${token}` },
            })

            return jsonResponse(
              {
                status: 200,
                message: 'Item and associated variants deleted successfully',
                success: true,
              },
              200,
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
            console.error('Error in DELETE /api/inventory:', error)
            const errorResponse = handleApiError(error, 'deleting')
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
