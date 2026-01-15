import { createFileRoute } from '@tanstack/react-router'
import { imagekit } from '@/lib/imagekit'
import { deleteImagesOneByOne } from '@/helpers/image/formatImage'

export const Route = createFileRoute('/api/imagekit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const {
            base64Image,
            fileName,
            folder = '/category',
          } = await request.json()

          if (!base64Image) {
            return new Response(
              JSON.stringify({ error: 'No image data provided' }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Upload using ImageKit SDK
          const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: fileName || `upload_${Date.now()}.jpg`,
            folder: folder,
          })

          // Hash fragments aren't sent to server, so won't affect ImageKit
          const urlWithFileId = `${uploadResponse.url}#${uploadResponse.fileId}`

          return new Response(
            JSON.stringify({
              success: true,
              url: urlWithFileId,
              fileId: uploadResponse.fileId,
              thumbnailUrl: uploadResponse.thumbnailUrl,
              filePath: uploadResponse.filePath,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('ImageKit upload error:', error)
          return new Response(
            JSON.stringify({
              error: 'Failed to upload image',
              details: error.message || 'Unknown error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
      DELETE: async ({ request }) => {
        try {
          const body = await request.json()
          const { img_id, imageUrl, imageUrls } = body

          // Support multiple formats
          if (img_id) {
            // Single deletion by file ID (legacy support)
            await imagekit.deleteFile(img_id)
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Image deleted successfully',
                deleted: 1,
                failed: 0,
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Convert to array for unified handling
          const urlsToDelete = imageUrls || (imageUrl ? [imageUrl] : [])

          if (urlsToDelete.length === 0) {
            return new Response(
              JSON.stringify({
                error: 'img_id, imageUrl, or imageUrls required',
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Delete multiple images using helper function
          const results = await deleteImagesOneByOne(urlsToDelete, imagekit)

          // Analyze results
          const failures = results.filter((r: any) => r.status === 'error')
          const successes = results.filter((r: any) => r.status === 'success')

          return new Response(
            JSON.stringify({
              success: true,
              deleted: successes.length,
              failed: failures.length,
              results,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('ImageKit delete error:', error)

          // If image already deleted or not found, return success
          if (
            error.message?.includes('NOT_FOUND') ||
            error.statusCode === 404
          ) {
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Image already deleted or not found',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }

          return new Response(
            JSON.stringify({
              error: 'Failed to delete image',
              details: error.message || 'Unknown error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
