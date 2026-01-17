// import { createServerFn } from '@tanstack/react-start'
// import { z } from 'zod'
// import axiosInstance from '../axios'
// import ImageKit from 'imagekit'
// import { extractFileIdFromUrl } from '@/helpers/image/imagekitHelpers'

// // Initialize ImageKit SDK
// const imagekit = new ImageKit({
//   publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
//   urlEndpoint: process.env.IMAGEKIT_PUBLIC_URL_ENDPOINT || '',
// })

// // Validation schemas
// const createCategorySchema = z.object({
//   name: z.string(),
//   description: z.string().optional(),
//   img: z.string(),
//   token: z.string(),
//   rid: z.string(),
// })

// const updateCategorySchema = z.object({
//   name: z.string(),
//   description: z.string().optional(),
//   img: z.string(),
//   categoryId: z.string(),
//   token: z.string(),
//   is_active: z.boolean().optional(),
//   rid: z.string(),
// })

// const deleteCategorySchema = z.object({
//   img: z.string().optional(),
//   token: z.string(),
//   id: z.string(),
//   rid: z.string(),
//   template_id: z.string().optional(),
// })

// // Server Functions
// export const createCategory = createServerFn({
//   method: 'POST',
// }).handler(async ({ data }: { data: z.infer<typeof createCategorySchema> }) => {
//   const validated = createCategorySchema.parse(data)
//   const { name, description, img, token, rid } = validated

//   if (!token) {
//     throw new Error('Access token is required')
//   }

//   try {
//     await axiosInstance.post(
//       '/category',
//       {
//         rid,
//         name,
//         description,
//         img,
//       },
//       { headers: { Authorization: `Bearer ${token}` } },
//     )

//     return {
//       status: 200,
//       message: 'Category added successfully',
//       success: true,
//     }
//   } catch (error) {
//     throw new Error(
//       `Failed to add category: ${error instanceof Error ? error.message : 'Unknown error'}`,
//     )
//   }
// })

// export const updateCategory = createServerFn({
//   method: 'POST',
// }).handler(async ({ data }: { data: z.infer<typeof updateCategorySchema> }) => {
//   const validated = updateCategorySchema.parse(data)
//   const { name, description, img, categoryId, token, is_active, rid } =
//     validated

//   if (!token) {
//     throw new Error('Access token is required')
//   }

//   try {
//     const payload = {
//       name,
//       description,
//       img,
//       id: categoryId,
//       rid,
//       is_active,
//     }

//     await axiosInstance.patch('/category', payload, {
//       headers: { Authorization: `Bearer ${token}` },
//     })

//     return {
//       status: 200,
//       message: 'Category updated successfully',
//       success: true,
//     }
//   } catch (error) {
//     throw new Error(
//       `Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`,
//     )
//   }
// })

// export const deleteCategory = createServerFn({
//   method: 'POST',
// }).handler(async ({ data }: { data: z.infer<typeof deleteCategorySchema> }) => {
//   const validated = deleteCategorySchema.parse(data)
//   const { img, token, id, rid, template_id } = validated

//   if (!token) {
//     throw new Error('Access token is required')
//   }

//   try {
//     // Only delete image from ImageKit if this is a custom category (no template_id)
//     if (img && !template_id) {
//       try {
//         const fileId = extractFileIdFromUrl(img)

//         if (fileId) {
//           await imagekit.deleteFile(fileId)
//         } else {
//           console.warn('Could not extract fileId from URL:', img)
//         }
//       } catch (imageError) {
//         console.error('Failed to delete ImageKit image:', imageError)
//         // Continue with category deletion even if image deletion fails
//       }
//     } else if (template_id) {
//       console.log(`Skipping image deletion - template_id: ${template_id}`)
//     }

//     // Delete category from database
//     await axiosInstance.delete(`/category`, {
//       data: { id, rid },
//       headers: { Authorization: `Bearer ${token}` },
//     })

//     return {
//       status: 200,
//       message: 'Category deleted successfully',
//       success: true,
//     }
//   } catch (error) {
//     throw new Error(
//       `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`,
//     )
//   }
// })
