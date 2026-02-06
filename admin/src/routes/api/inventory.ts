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
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/inventory')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')
          const categoryId = url.searchParams.get('category_id')

          // Get token from httpOnly cookie
          const token = getAccessTokenFromCookie(request)

          // Prepare params for backend call
          const params: any = {}
          if (rid) params.rid = rid
          if (categoryId) params.category_id = categoryId

          // Call backend
          // Note: Using axiosInstance which already has baseURL configured
          // and we attach the token manually or let interceptors handle it.
          // The current axiosInstance configuration (lib/axios.ts) doesn't seem to attach Bearer token automatically
          // from server-side cookies? lib/axios.ts says "Server routes handle adding Bearer tokens from httpOnly cookies".
          // So we must manually add the header here like in POST/PATCH.

          const headers: Record<string, string> = {}
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const response = await axiosInstance.get('/inventory', {
            params,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          })

          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('Error in GET /api/inventory:', error)
          const errorResponse = handleApiError(error, 'fetching')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      POST: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
          const token = getAccessTokenFromCookie(request)

          if (!token) {
            return new Response(
              JSON.stringify({
                status: 401,
                message: 'Not authenticated',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

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

          return new Response(
            JSON.stringify({
              status: 200,
              message:
                variants && variants.length > 0
                  ? 'Item and variants added successfully'
                  : 'Item added successfully',
              success: true,
              inventoryId: inventoryId,
              variantCount: variants ? variants.length : 0,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('Error in POST /api/inventory:', error)
          const errorResponse = handleApiError(error, 'adding')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      PATCH: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
          const token = getAccessTokenFromCookie(request)

          if (!token) {
            return new Response(
              JSON.stringify({
                status: 401,
                message: 'Not authenticated',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const data: any = await request.json()

          const { id, rid, variants, images, selectiveFields, currentStatus } =
            data

          if (!id || !rid) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Item ID and Restaurant ID are required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
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

          return new Response(
            JSON.stringify({
              status: 200,
              message,
              success: true,
              variantCount: variants ? variants.length : undefined,
              updatedFields: isSelectiveUpdate ? selectiveFields : undefined,
              isSelectiveUpdate,
              statusAutoUpdated: wasStatusAutoUpdated,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('Error in PATCH /api/inventory:', error)
          const errorResponse = handleApiError(error, 'updating')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      DELETE: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
          const token = getAccessTokenFromCookie(request)

          if (!token) {
            return new Response(
              JSON.stringify({
                status: 401,
                message: 'Not authenticated',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const data: any = await request.json()
          const { id, img, rid } = data

          if (!id || !rid) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Item ID and Restaurant ID are required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
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

          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Item and associated variants deleted successfully',
              success: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          console.error('Error in DELETE /api/inventory:', error)
          const errorResponse = handleApiError(error, 'deleting')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
