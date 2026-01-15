# TanStack Query Hooks

This directory contains centralized query and mutation hooks for data fetching with TanStack Query.

## Benefits

✅ **Automatic Caching** - Data is cached and reused across components  
✅ **Smart Refetching** - Auto-refetches on window focus, reconnect, and stale data  
✅ **Request Deduplication** - Multiple components requesting same data = single request  
✅ **Built-in Loading & Error States** - No manual `useState` management  
✅ **Optimistic Updates** - UI updates before server confirms  
✅ **Retry Logic** - Automatic retries on failed requests

## Usage

### Queries

```typescript
import { useCategoriesQuery } from '@/hooks/queries'

function MyComponent() {
  const { data, isLoading, error, refetch } = useCategoriesQuery(restaurantId)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error! <button onClick={() => refetch()}>Retry</button></div>

  const categories = data?.categories || []
  // ... use categories
}
```

### Mutations

```typescript
import { useCreateCategoryMutation } from '@/hooks/queries'

function CreateCategory() {
  const createCategory = useCreateCategoryMutation()

  const handleCreate = async () => {
    await createCategory.mutateAsync({
      rid: '123',
      name: 'New Category',
      description: 'Description',
      token: 'token',
    })
    // Categories are automatically refetched!
  }

  return <button onClick={handleCreate}>Create</button>
}
```

## Available Hooks

### Queries

- `useCategoriesQuery(rid, enabled?)` - Fetch categories for a restaurant
- `useCuisineTypesQuery(enabled?)` - Fetch available cuisine types
- `useTemplatesByCuisineQuery(cuisineType, enabled?)` - Fetch templates by cuisine

### Mutations

- `useCreateCategoriesFromTemplatesMutation()` - Bulk create from templates
- `useCreateCategoryMutation()` - Create single category
- `useUpdateCategoryMutation()` - Update category
- `useDeleteCategoryMutation()` - Delete category

## Query Keys

Use `categoryKeys` for manual cache manipulation:

```typescript
import { categoryKeys } from '@/hooks/queries'
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Invalidate specific restaurant's categories
queryClient.invalidateQueries({ queryKey: categoryKeys.byRestaurant(rid) })

// Prefetch categories
queryClient.prefetchQuery({
  queryKey: categoryKeys.byRestaurant(rid),
  queryFn: () => fetchCategories(rid),
})
```

## Configuration

- **staleTime**: 5 minutes (queries), 30 minutes (templates)
- **gcTime**: 10 minutes (queries), 60 minutes (templates)
- **retry**: 2 attempts on failure
