// import { createServerFn } from '@tanstack/react-start'
// import { z } from 'zod'
// import axiosInstance from '../axios'

// // Validation schema
// const restaurantQuerySchema = z.object({
//   accessToken: z.string(),
//   rid: z.string().optional(),
//   restaurant_rids: z.array(z.number()).optional(),
// })

// // Server Function
// export const getRestaurantInfo = createServerFn({
//   method: 'GET',
// }).handler(
//   async ({ data }: { data: z.infer<typeof restaurantQuerySchema> }) => {
//     const validated = restaurantQuerySchema.parse(data)
//     const { accessToken, rid, restaurant_rids } = validated

//     if (!accessToken) {
//       throw new Error('Unauthorized')
//     }

//     try {
//       if (!rid) {
//         // Fetch all restaurants
//         if (!restaurant_rids || restaurant_rids.length === 0) {
//           return {
//             statusCode: 200,
//             message: 'No restaurants found',
//             restaurants: [],
//           }
//         }

//         const restaurantPromises = restaurant_rids.map(
//           async (restaurantId: number) => {
//             try {
//               const response = await axiosInstance.get(
//                 `/restaurant?rid=${restaurantId}`,
//                 {
//                   headers: { Authorization: `Bearer ${accessToken}` },
//                 },
//               )
//               return response.data?.restaurant_info || null
//             } catch (error) {
//               console.error(
//                 `Failed to fetch restaurant ${restaurantId}:`,
//                 error,
//               )
//               return null
//             }
//           },
//         )

//         const restaurants = await Promise.all(restaurantPromises)
//         const validRestaurants = restaurants.filter(Boolean)

//         return {
//           statusCode: 200,
//           message: 'success',
//           restaurants: validRestaurants,
//         }
//       }

//       // Fetch specific restaurant
//       const response = await axiosInstance.get(`/restaurant?rid=${rid}`, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       })

//       return {
//         statusCode: 200,
//         message: 'success',
//         restaurant_info: response.data?.restaurant_info || response.data,
//         restaurant_hours: response.data?.restaurant_hours || [],
//       }
//     } catch (error: any) {
//       throw new Error(
//         error.response?.data?.message || 'Failed to fetch restaurant details',
//       )
//     }
//   },
// )
