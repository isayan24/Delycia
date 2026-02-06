// Category Queries and Mutations
export {
  useCategoriesQuery,
  useCuisineTypesQuery,
  useTemplatesByCuisineQuery,
  useCreateCategoriesFromTemplatesMutation,
  useCreateCategoryMutation,
  useCreateCategoryAsTemplateMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  categoryKeys,
} from './useCategoriesQuery'

// Inventory Queries and Mutations
export {
  useInventoryQuery,
  useInventoryItemQuery,
  useInventoryVariantsQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useBulkCreateInventoryMutation,
  inventoryKeys,
} from './useInventoryQuery'

// Orders Queries and Mutations
export {
  useOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  orderKeys,
} from './useOrdersQuery'

// Tables Queries and Mutations
export {
  useTablesQuery,
  useZonesQuery,
  useTablesAndZones,
  useCreateTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
  tableKeys,
  type Table,
  type Zone,
} from './useTablesQuery'

// Restaurant Queries
export { useRestaurantQuery, restaurantKeys } from './useRestaurantQuery'

// Restaurants Queries (multiple restaurants)
export {
  useRestaurantsQuery,
  restaurantKeys as restaurantsKeys,
  type Restaurant,
  type RestaurantMap,
} from './useRestaurantsQuery'
