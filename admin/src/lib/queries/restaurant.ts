// import { queryOptions } from '@tanstack/react-query'
// import { getRestaurantInfo } from '../api/restaurant'
// import { queryKeys } from './queryKeys'

// // Restaurant Query Options
// export const restaurantQueries = {
//   // Get restaurant info
//   info: (accessToken: string, rid?: string, restaurant_rids?: number[]) =>
//     queryOptions({
//       queryKey: rid ? queryKeys.restaurant.info(rid) : queryKeys.restaurant.all,
//       queryFn: async () => {
//         const result = await getRestaurantInfo({
//           data: { accessToken, rid, restaurant_rids },
//         })
//         return result
//       },
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       gcTime: 10 * 60 * 1000, // 10 minutes
//     }),

//   // Get specific restaurant with hours
//   detail: (accessToken: string, rid: string) =>
//     queryOptions({
//       queryKey: [...queryKeys.restaurant.info(rid), 'detail'] as const,
//       queryFn: async () => {
//         const result = await getRestaurantInfo({
//           data: { accessToken, rid },
//         })
//         return result
//       },
//       staleTime: 5 * 60 * 1000,
//     }),
// }
