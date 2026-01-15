# TanStack Query Integration Guide

## Overview

This guide shows how to use the query patterns and mutations with TanStack Query in the migrated TanStack Start application.

## Query Key Factory

All query keys are managed centrally in `src/lib/queries/queryKeys.ts`:

```typescript
import { queryKeys } from '@/lib/queries'

// Examples:
queryKeys.categories.all // ['categories']
queryKeys.categories.list({}) // ['categories', 'list', {}]
queryKeys.orders.realtime(rid) // ['orders', 'realtime', rid]
```

---

## Using Queries

### Restaurant Info

```typescript
import { useQuery } from '@tanstack/react-query'
import { restaurantQueries } from '@/lib/queries/restaurant'
import { useAuth } from '@/hooks/useAuth'

function RestaurantInfo({ rid }: { rid: string }) {
  const { accessToken } = useAuth()

  const { data, isLoading, error } = useQuery(
    restaurantQueries.info(accessToken, rid)
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{data?.restaurant_info?.name}</h1>
      <p>{data?.restaurant_info?.address}</p>
    </div>
  )
}
```

---

## Using Mutations

### Category Mutations

```typescript
import { useCategoryMutations } from '@/lib/queries/categories'
import { useAuth } from '@/hooks/useAuth'

function CreateCategoryForm() {
  const { accessToken, user } = useAuth()
  const { create, update, delete: deleteCategory } = useCategoryMutations()

  const handleCreate = async (formData: FormData) => {
    try {
      await create.mutateAsync({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        img: formData.get('img') as string,
        token: accessToken,
        rid: user.selected_rid,
      })
      // Success - categories list will auto-refetch
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleCreate(new FormData(e.currentTarget))
    }}>
      <input name="name" required />
      <textarea name="description" />
      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Creating...' : 'Create Category'}
      </button>
    </form>
  )
}
```

### Order Mutations (with Optimistic Updates)

```typescript
import { useOrderMutations } from '@/lib/queries/orders'
import { useAuth } from '@/hooks/useAuth'

function OrderStatusUpdater({ orderIds }: { orderIds: string[] }) {
  const { accessToken } = useAuth()
  const { update } = useOrderMutations()

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await update.mutateAsync({
        token: accessToken,
        order_item_ids: orderIds,
        order_status: newStatus,
      })
      // UI updates optimistically, then confirms with server
    } catch (error) {
      // Auto-rollback if error occurs
      console.error('Failed to update orders:', error)
    }
  }

  return (
    <div>
      <button onClick={() => handleStatusUpdate('preparing')}>
        Mark as Preparing
      </button>
      <button onClick={() => handleStatusUpdate('completed')}>
        Mark as Completed
      </button>
    </div>
  )
}
```

### Table Mutations

```typescript
import { useTableMutations } from '@/lib/queries/tables'
import { useAuth } from '@/hooks/useAuth'

function TableManager() {
  const { accessToken, user } = useAuth()
  const { create, delete: deleteTable } = useTableMutations()

  const handleCreateTable = async () => {
    await create.mutateAsync({
      rid: user.selected_rid,
      table_number: '10',
      capacity: 4,
      zone: 'main',
      accessToken,
    })
  }

  const handleDeleteTable = async (tableId: string) => {
    await deleteTable.mutateAsync({
      id: tableId,
      accessToken,
    })
  }

  return (
    <div>
      <button onClick={handleCreateTable}>Create Table</button>
      {/* Table list with delete buttons */}
    </div>
  )
}
```

---

## Prefetching in Route Loaders

Use route loaders to prefetch data before rendering:

```typescript
// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { restaurantQueries } from '@/lib/queries/restaurant'

export const Route = createFileRoute('/dashboard')({
  loader: async ({ context }) => {
    const { queryClient, accessToken, user } = context

    // Prefetch restaurant info
    await queryClient.ensureQueryData(
      restaurantQueries.info(accessToken, user.selected_rid)
    )
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { user, accessToken } = useAuth()

  // Data is already loaded from the loader
  const { data } = useQuery(
    restaurantQueries.info(accessToken, user.selected_rid)
  )

  return <div>{/* Use data immediately */}</div>
}
```

---

## Manual Cache Invalidation

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries'

function MyComponent() {
  const queryClient = useQueryClient()

  const refreshOrders = () => {
    // Invalidate all order queries
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
  }

  const refreshSpecificCategory = (categoryId: string) => {
    // Invalidate specific category
    queryClient.invalidateQueries({
      queryKey: queryKeys.categories.detail(categoryId)
    })
  }

  return (
    <div>
      <button onClick={refreshOrders}>Refresh Orders</button>
    </div>
  )
}
```

---

## Benefits

✅ **Type-Safe**: All queries and mutations are fully typed
✅ **Auto-Refetch**: Data automatically refetches on window focus
✅ **Cache Management**: Organized query keys for easy invalidation
✅ **Optimistic Updates**: Instant UI updates with automatic rollback
✅ **Prefetching**: Faster page loads with route loaders
✅ **Error Handling**: Built-in error states and retry logic

---

## Next Steps

1. Convert existing `useEffect` + `axios` calls to use queries
2. Replace manual state management with TanStack Query cache
3. Add prefetching to all route loaders
4. Implement real-time updates with WebSocket + auto-invalidation
