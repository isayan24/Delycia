import { createFileRoute } from '@tanstack/react-router'
import { imagekit } from '@/lib/imagekit'
import { deleteImagesOneByOne } from '@/helpers/image/imagekitHelpers'

/**
 * ImageKit API Route
 * 
 * Provides HTTP endpoints for uploading and deleting images via ImageKit.
 * This route handles ImageKit SDK operations only and does not require authentication.
 * 
 * Endpoints:
 * - POST /api/imagekit: Upload image to ImageKit
 * - DELETE /api/imagekit: Delete image(s) from ImageKit
 */
export const Route = createFileRoute('/api/imagekit')({
  server: {
    handlers: {
      /**
       * POST Handler - Upload Image
       * 
       * Accepts base64-encoded image data and uploads to ImageKit.
       * Returns URL with fileId appended as hash fragment.
       * 
       * Request body:
       * - base64Image: Base64-encoded image data (required)
       * - fileName: Custom filename (optional)
       * - folder: Upload folder path (optional, default: /profile-pictures)
       * 
       * Response:
       * - success: boolean
       * - url: Image URL with fileId hash fragment
       * - fileId: ImageKit file identifier
       * - thumbnailUrl: Thumbnail URL
       * - filePath: File path in ImageKit storage
       */
      POST: async ({ request }) => {
        try {
          const {
            base64Image,
            fileName,
            folder = '/profile-pictures',
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
            fileName: fileName || `profile_${Date.now()}.jpg`,
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
          console.error('[API /api/imagekit POST] Upload error:', error)
          return new Response(
            JSON.stringify({
              error: 'Failed to upload image',
              details: error.message || 'Unknown error',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },

      /**
       * DELETE Handler - Delete Image(s)
       * 
       * Deletes one or more images from ImageKit. Supports multiple input formats.
       * 
       * Request body (one of):
       * - img_id: Direct fileId for single deletion
       * - imageUrl: Single URL (fileId extracted from hash)
       * - imageUrls: Array of URLs for batch deletion
       * 
       * Response:
       * - success: boolean
       * - message: Status message (optional)
       * - deleted: Count of successfully deleted images
       * - failed: Count of failed deletions
       * - results: Array of deletion results (for batch operations)
       */
      DELETE: async ({ request }) => {
        try {
          const body = await req.json()
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
          console.error('[API /api/imagekit DELETE] Delete error:', error)

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

