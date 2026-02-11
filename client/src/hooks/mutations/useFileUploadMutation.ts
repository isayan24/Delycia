import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

/**
 * File Upload Mutation Hook
 * 
 * Provides TanStack Query mutations for uploading and deleting images via ImageKit.
 */

interface FileUploadVariables {
  base64Image: string
  fileName?: string
  folder?: string
}

interface FileUploadResponse {
  success: boolean
  url: string
  fileId: string
  thumbnailUrl: string
  filePath: string
}

interface FileDeleteVariables {
  imageUrl?: string
  imageUrls?: string[]
  img_id?: string
}

interface FileDeleteResponse {
  success: boolean
  message?: string
  deleted: number
  failed: number
  results?: Array<{ url: string; status: string; error?: string }>
}

/**
 * Upload Image Mutation Hook
 * 
 * Uploads a base64-encoded image to ImageKit.
 * 
 * @example
 * const uploadMutation = useFileUploadMutation()
 * 
 * uploadMutation.mutate({
 *   base64Image: "base64data...",
 *   fileName: "profile.jpg",
 *   folder: "/profile-pictures"
 * })
 */
export const useFileUploadMutation = () => {
  return useMutation({
    mutationFn: async (variables: FileUploadVariables) => {
      const response = await axios.post('/api/imagekit', {
        base64Image: variables.base64Image,
        fileName: variables.fileName,
        folder: variables.folder || '/profile-pictures',
      })
      return response.data as FileUploadResponse
    },
  })
}

/**
 * Delete Image Mutation Hook
 * 
 * Deletes one or more images from ImageKit.
 * Supports multiple input formats: fileId, single URL, or array of URLs.
 * 
 * @example
 * const deleteMutation = useFileDeleteMutation()
 * 
 * // Delete by fileId
 * deleteMutation.mutate({ img_id: "abc123" })
 * 
 * // Delete by URL
 * deleteMutation.mutate({ imageUrl: "https://ik.imagekit.io/demo/img.jpg#abc123" })
 */
export const useFileDeleteMutation = () => {
  return useMutation({
    mutationFn: async (variables: FileDeleteVariables) => {
      const response = await axios.delete('/api/imagekit', {
        data: variables,
      })
      return response.data as FileDeleteResponse
    },
  })
}
