import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import ImageKit from 'imagekit'
import { deleteImagesOneByOne } from '@/helpers/image/formatImage'

// Initialize ImageKit SDK
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_PUBLIC_URL_ENDPOINT || '',
})

// Validation schemas
const uploadImageSchema = z.object({
  base64Image: z.string(),
  fileName: z.string().optional(),
  folder: z.string().optional().default('/category'),
})

const deleteImageSchema = z.object({
  img_id: z.string().optional(),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
})

// Server Functions
export const uploadImage = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof uploadImageSchema> }) => {
  const validated = uploadImageSchema.parse(data)
  const { base64Image, fileName, folder } = validated

  if (!base64Image) {
    throw new Error('No image data provided')
  }

  try {
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: fileName || `upload_${Date.now()}.jpg`,
      folder: folder,
    })

    const urlWithFileId = `${uploadResponse.url}#${uploadResponse.fileId}`

    return {
      success: true,
      url: urlWithFileId,
      fileId: uploadResponse.fileId,
      thumbnailUrl: uploadResponse.thumbnailUrl,
      filePath: uploadResponse.filePath,
    }
  } catch (error) {
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
})

export const deleteImage = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof deleteImageSchema> }) => {
  const validated = deleteImageSchema.parse(data)
  const { img_id, imageUrl, imageUrls } = validated

  try {
    // Single deletion by file ID
    if (img_id) {
      await imagekit.deleteFile(img_id)
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

    const results = await deleteImagesOneByOne(urlsToDelete, imagekit)

    const failures = results.filter((r: any) => r.status === 'error')
    const successes = results.filter((r: any) => r.status === 'success')

    return {
      success: true,
      deleted: successes.length,
      failed: failures.length,
      results,
    }
  } catch (error: any) {
    // If image already deleted or not found, return success
    if (error.message?.includes('NOT_FOUND') || error.statusCode === 404) {
      return {
        success: true,
        message: 'Image already deleted or not found',
      }
    }

    throw new Error(
      `Failed to delete image: ${error.message || 'Unknown error'}`,
    )
  }
})
