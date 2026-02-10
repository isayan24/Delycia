import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { imagekit } from '@/lib/imagekit'
import { extractFileIdFromUrl } from '@/helpers/image/imagekitHelpers'
import { withAuth, jsonResponse } from '@/lib/withAuth'

export const Route = createFileRoute('/api/category')({
  server: {
    handlers: {
      // GET - Fetch categories by restaurant ID
      GET: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          const url = new URL(request.url)
          const rid = url.searchParams.get('rid')

          if (!rid) {
            return jsonResponse(
              {
                status: 400,
                message: 'Restaurant ID (rid) is required',
                error: true,
              },
              400,
            )
          }

          try {
            // Call backend API to get categories
            const response = await axiosInstance.get('/categories', {
              params: { rid },
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            // ❌ REMOVED Cache-Control - was causing 5 minute delay!
            // Browser/CDN was caching old data even after mutations
            return jsonResponse(response.data, 200, authHeaders)
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Failed to fetch categories',
            )
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      // POST - Create new category
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const body = await request.json()
            const { name, description, img, rid } = body

            const response = await axiosInstance.post(
              '/category',
              {
                rid,
                name,
                description,
                img,
              },
              { headers: { Authorization: `Bearer ${accessToken}` } },
            )

            // Return the created category data for optimistic updates
            return jsonResponse(
              {
                status: 200,
                message: 'Category added successfully',
                success: true,
                category: response.data?.category || response.data, // Return the category data
              },
              200,
              authHeaders,
            )
          } catch (error) {
            const errorResponse = handleApiError(error, 'Failed to add category')
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      PATCH: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const body = await request.json()
            const { rid, id, name, description, img, is_active } = body

            const data = {
              name,
              description,
              img,
              id,
              rid,
              is_active,
            }

            await axiosInstance.patch('/category', data, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })

            return jsonResponse(
              {
                status: 200,
                message: 'Category updated successfully',
                success: true,
              },
              200,
              authHeaders,
            )
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Failed to update category',
            )
            return jsonResponse(
              errorResponse,
              (errorResponse as any).status || 500,
              authHeaders,
            )
          }
        })
      },
      DELETE: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders) => {
          try {
            const body = await request.json()
            const { img, id, rid, template_id } = body

            // Only delete image from ImageKit if this is a custom category (no template_id)
            if (img && !template_id) {
              try {
                const fileId = extractFileIdFromUrl(img)

                if (fileId) {
                  await imagekit.deleteFile(fileId)
                } else {
                  console.warn('Could not extract fileId from URL:', img)
                }
              } catch (imageError) {
                console.error('Failed to delete ImageKit image:', imageError)
                // Continue with category deletion even if image deletion fails
              }
            } else if (template_id) {
              console.log(`Skipping image deletion - template_id: ${template_id}`)
            }

            // Delete category from database
            await axiosInstance.delete(`/category`, {
              data: { id, rid },
              headers: { Authorization: `Bearer ${accessToken}` },
            })

            return jsonResponse(
              {
                status: 200,
                message: 'Category deleted successfully',
                success: true,
              },
              200,
              authHeaders,
            )
          } catch (error) {
            const errorResponse = handleApiError(
              error,
              'Failed to delete category',
            )
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
