import { createFileRoute } from '@tanstack/react-router'
import { handleApiError } from '@/helpers/handleApiError'
import axiosInstance from '@/lib/axios'
import { imagekit } from '@/lib/imagekit'
import { extractFileIdFromUrl } from '@/helpers/image/imagekitHelpers'

export const Route = createFileRoute('/api/category')({
  server: {
    handlers: {
      // GET - Fetch categories by restaurant ID
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const rid = url.searchParams.get('rid')

        if (!rid) {
          return new Response(
            JSON.stringify({
              status: 400,
              message: 'Restaurant ID (rid) is required',
              error: true,
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
          )
        }

        try {
          // Call backend API to get categories
          const response = await axiosInstance.get('/categories', {
            params: { rid },
          })

          // ❌ REMOVED Cache-Control - was causing 5 minute delay!
          // Browser/CDN was caching old data even after mutations
          return new Response(JSON.stringify(response.data), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate', // Always fetch fresh data
            },
          })
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Failed to fetch categories',
          )
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      // POST - Create new category
      POST: async ({ request }) => {
        const body = await request.json()
        const { name, description, img, token, rid } = body

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
            '/category',
            {
              rid,
              name,
              description,
              img,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          )

          // Return the created category data for optimistic updates
          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Category added successfully',
              success: true,
              category: response.data?.category || response.data, // Return the category data
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(error, 'Failed to add category')
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      PATCH: async ({ request }) => {
        const body = await request.json()
        const { rid, id, name, description, img, token, is_active } = body
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
          const data = {
            name,
            description,
            img,
            id,
            rid,
            is_active,
          }

          await axiosInstance.patch('/category', data, {
            headers: { Authorization: `Bearer ${token}` },
          })

          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Category updated successfully',
              success: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Failed to update category',
          )
          return new Response(JSON.stringify(errorResponse), {
            status: (errorResponse as any).status || 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
      DELETE: async ({ request }) => {
        const body = await request.json()
        const { img, token, id, rid, template_id } = body

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
            headers: { Authorization: `Bearer ${token}` },
          })

          return new Response(
            JSON.stringify({
              status: 200,
              message: 'Category deleted successfully',
              success: true,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error) {
          const errorResponse = handleApiError(
            error,
            'Failed to delete category',
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
