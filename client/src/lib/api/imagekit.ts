import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { imagekit } from '@/lib/imagekit'
import { deleteImagesOneByOne } from '@/helpers/image/imagekitHelpers'

/**
 * ImageKit Server Functions
 * 
 * Type-safe server functions for uploading and deleting images using ImageKit SDK.
 * These functions run on the server and are called from client-side mutation hooks.
 */

// Validation schemas
const uploadImageSchema = z.object({
  base64Image: z.string(),
  fileName: z.string().optional(),
  folder: z.string().optional().default('/profile-pictures'),
})

const deleteImageSchema = z.object({
  img_id: z.string().optional(),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
})

/**
 * Upload Image Server Function
 * 
 * Uploads a base64-encoded image to ImageKit and returns the URL with fileId in hash fragment.
 * 
 * @param data.base64Image - Base64-encoded image data
 * @param data.fileName - Optional custom filename
 * @param data.folder - Upload folder path (default: /profile-pictures)
 * @returns Upload response with URL containing fileId hash fragment
 */
export const uploadImage = createServerFn({
  method: 'POST',
})
  .inputValidator((d) => uploadImageSchema.parse(d))
  .handler(async ({ data }) => {
    const { base64Image, fileName, folder } = data

    if (!base64Image) {
      throw new Error('No image data provided')
    }

    try {
      console.log('[uploadImage] Uploading image to ImageKit, folder:', folder)
      
      const uploadResponse = await imagekit.upload({
        file: base64Image,
        fileName: fileName || `profile_${Date.now()}.jpg`,
        folder: folder,
      })

      // Append fileId as hash fragment for easy deletion later
      const urlWithFileId = `${uploadResponse.url}#${uploadResponse.fileId}`

      console.log('[uploadImage] Upload successful, URL:', urlWithFileId)

      return {
        success: true,
        url: urlWithFileId,
        fileId: uploadResponse.fileId,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        filePath: uploadResponse.filePath,
      }
    } catch (error) {
      console.error('[uploadImage] Upload failed:', error)
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  })

/**
 * Delete Image Server Function
 * 
 * Deletes one or more images from ImageKit. Supports multiple input formats:
 * - img_id: Direct fileId for single deletion
 * - imageUrl: Single URL (fileId extracted from hash)
 * - imageUrls: Array of URLs for batch deletion
 * 
 * @param data.img_id - Direct fileId for deletion
 * @param data.imageUrl - Single URL to delete
 * @param data.imageUrls - Array of URLs to delete
 * @returns Deletion results with success/failure counts
 */
export const deleteImage = createServerFn({
  method: 'POST',
})
  .inputValidator((d) => deleteImageSchema.parse(d))
  .handler(async ({ data }) => {
    const { img_id, imageUrl, imageUrls } = data

    try {
      // Single deletion by file ID
      if (img_id) {
        console.log('[deleteImage] Deleting image by fileId:', img_id)
        await imagekit.deleteFile(img_id)
        console.log('[deleteImage] Deletion successful')
        return {
          success: true,
          message: 'Image deleted successfully',
          deleted: 1,
          failed: 0,
        }
      }

      // Multiple deletions
      const urlsToDelete = imageUrls || (imageUrl ? [imageUrl] : [])

      if (urlsToDelete.length === 0) {
        throw new Error('img_id, imageUrl, or imageUrls required')
      }

      console.log('[deleteImage] Deleting images:', urlsToDelete)
      const results = await deleteImagesOneByOne(urlsToDelete, imagekit)

      const failures = results.filter((r: any) => r.status === 'error')
      const successes = results.filter((r: any) => r.status === 'success')

      console.log('[deleteImage] Deletion complete:', {
        deleted: successes.length,
        failed: failures.length,
      })

      return {
        success: true,
        deleted: successes.length,
        failed: failures.length,
        results,
      }
    } catch (error: any) {
      // If image already deleted or not found, return success
      if (error.message?.includes('NOT_FOUND') || error.statusCode === 404) {
        console.log('[deleteImage] Image already deleted or not found')
        return {
          success: true,
          message: 'Image already deleted or not found',
        }
      }

      console.error('[deleteImage] Deletion failed:', error)
      throw new Error(
        `Failed to delete image: ${error.message || 'Unknown error'}`,
      )
    }
  })
