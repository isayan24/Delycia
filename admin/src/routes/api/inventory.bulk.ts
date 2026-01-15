import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import { handleApiError } from '@/helpers/handleApiError'
import { formatImageToArrayString } from '@/helpers/image/formatImage'
import { BulkInventoryRequest } from '@/helpers/inventory/types'

export const Route = createFileRoute('/api/inventory/bulk')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data: BulkInventoryRequest = await request.json()

          const { token, rid, category_id, is_veg, items } = data

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

          if (!rid || !category_id) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Restaurant ID and category ID are required',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (!items || !Array.isArray(items) || items.length === 0) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Items array is required and must not be empty',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          if (items.length > 100) {
            return new Response(
              JSON.stringify({
                status: 400,
                message: 'Maximum 100 items allowed per bulk request',
                error: true,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
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
              headers: { Authorization: `Bearer ${token}` },
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

          return new Response(
            JSON.stringify({
              status: inserted > 0 ? 200 : 400,
              message,
              success: inserted > 0,
              inserted,
              failed,
              errors: failed > 0 ? errors : undefined,
            }),
            {
              status: inserted > 0 ? 200 : 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          console.error('Error in POST /api/inventory/bulk:', error)
          const errorResponse = handleApiError(error, 'bulk adding items')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
