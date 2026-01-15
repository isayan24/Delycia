// import axiosInstance from '@/lib/axios'

// export const fetchCategories = async (rid: string) => {
//   try {
//     const response = await axiosInstance.get('/categories', {
//       params: { rid },
//     })

//     return response.data
//   } catch (error) {
//     throw new Error('Failed to fetch categories')
//   }
// }

// // Category Template API helpers
// export const getCuisineTypes = async () => {
//   try {
//     const response = await axiosInstance.get('/category-templates')
//     return response.data.cuisine_types || []
//   } catch (error) {
//     throw new Error('Failed to fetch cuisine types')
//   }
// }

// export const getTemplatesByCuisine = async (cuisineType: string) => {
//   try {
//     const response = await axiosInstance.get('/category-templates', {
//       params: { cuisine_type: cuisineType },
//     })
//     return response.data.templates || []
//   } catch (error) {
//     throw new Error('Failed to fetch templates')
//   }
// }

// export const createFromTemplates = async (
//   rid: string,
//   template_ids: number[],
//   token: string,
// ) => {
//   try {
//     const response = await axiosInstance.post(
//       '/categories/bulk-from-templates',
//       {
//         rid,
//         template_ids,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     )
//     return response.data
//   } catch (error) {
//     throw new Error('Failed to create categories from templates')
//   }
// }
