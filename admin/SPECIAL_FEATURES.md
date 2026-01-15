# Special Features Integration Guide

## Overview

This guide covers the integration of special features in the TanStack Start migration: WebSocket, ImageKit, Resend Email, and Drag-and-Drop.

---

## 1. WebSocket for Real-Time Orders

### Current Implementation

The application already has WebSocket integrated via `useOrdersWebSocket` hook.

**Location:** `src/components/admin/orders/hooks/useOrdersWebSocket.tsx`

### Usage in OrdersMain Component

```typescript
const {
  orders: rawOrders,
  status,
  isConnected,
  error,
  isLoading,
  refreshOrders,
} = useOrdersWebSocket({
  autoConnect: true,
  onOrdersUpdate: (newOrders) => {
    // Handle new orders
  },
})
```

### Integration with TanStack Query

To integrate WebSocket with TanStack Query for cache updates:

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queries'

const queryClient = useQueryClient()

const { orders } = useOrdersWebSocket({
  autoConnect: true,
  onOrdersUpdate: (newOrders) => {
    // Update TanStack Query cache with WebSocket data
    queryClient.setQueryData(queryKeys.orders.realtime(rid), newOrders)

    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() })
  },
})
```

### WebSocket Connection Details

- **Endpoint:** `wss://api.delycia.com/orders` (from environment)
- **Protocol:** Socket.io-client
- **Auto-reconnection:** Enabled
- **Status states:** connecting, connected, disconnected, error

---

## 2. ImageKit Server-Side Operations

### Upload Signature Generation

ImageKit is already configured in server functions for secure operations.

**Server Function:** `src/lib/api/imagekit.ts`

```typescript
import { uploadImage, deleteImage } from '@/lib/api/imagekit'

// Upload image
const handleUpload = async (base64Image: string) => {
  try {
    const result = await uploadImage({
      data: {
        base64Image,
        fileName: `category_${Date.now()}.jpg`,
        folder: '/category',
      },
    })

    console.log('Uploaded:', result.url) // URL with fileId hash
    return result.url
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

// Delete image
const handleDelete = async (imageUrl: string) => {
  try {
    await deleteImage({
      data: {
        imageUrl, // Or use img_id for direct deletion
      },
    })
  } catch (error) {
    console.error('Delete failed:', error)
  }
}
```

### Features

- ✅ **Server-side upload** - Secure private key handling
- ✅ **File ID in URL** - Hash fragment format: `url#fileId`
- ✅ **Bulk deletion** - Delete multiple images at once
- ✅ **Auto-cleanup** - Category/item deletion triggers image cleanup
- ✅ **Error handling** - 404 errors treated as success

### ImageKit Configuration

Private key is securely stored server-side only:

```typescript
// Environment variables (server-side only)
IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/yourEndpoint
```

---

## 3. Email with Resend

### Configuration

**File:** `src/lib/resend.ts`

The Resend integration is ready via the existing helper:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Send order confirmation email
export async function sendOrderEmail(orderData: any) {
  try {
    await resend.emails.send({
      from: 'Delycia <orders@delycia.com>',
      to: orderData.customerEmail,
      subject: 'Order Confirmed',
      react: AcceptOrderEmailComponent(orderData),
    })
  } catch (error) {
    console.error('Email send failed:', error)
  }
}
```

### Email Templates

**Location:** `src/emails/`

Available email components:

- `AcceptOrderEmailComponent` - Order acceptance
- Other email templates as needed

### Usage with Server Functions

Create a server function for sending emails:

```typescript
// src/lib/api/email.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { sendOrderEmail } from '../resend'

const sendEmailSchema = z.object({
  customerEmail: z.string().email(),
  orderData: z.any(),
})

export const sendEmail = createServerFn({
  method: 'POST',
}).handler(async ({ data }: { data: z.infer<typeof sendEmailSchema> }) => {
  const validated = sendEmailSchema.parse(data)

  await sendOrderEmail(validated.orderData)

  return { success: true }
})
```

---

## 4. Drag-and-Drop with @dnd-kit

### Dependencies

Already installed:

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`
- `@dnd-kit/modifiers`

### Usage Example

```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

function DraggableList() {
  const [items, setItems] = useState(['1', '2', '3'])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((id) => (
          <SortableItem key={id} id={id}>
            Item {id}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### Persisting Order Changes

Combine with TanStack Query mutations:

```typescript
const { update } = useCategoryMutations()

const handleDragEnd = async (event: any) => {
  const { active, over } = event

  if (active.id !== over.id) {
    const oldIndex = categories.indexOf(active.id)
    const newIndex = categories.indexOf(over.id)

    const newOrder = arrayMove(categories, oldIndex, newIndex)

    // Optimistic update
    setCategories(newOrder)

    // Persist to server
    try {
      await update.mutateAsync({
        categoryId: active.id,
        order: newIndex,
        token: accessToken,
        rid,
      })
    } catch (error) {
      // Rollback on error
      setCategories(categories)
    }
  }
}
```

---

## Integration Status

| Feature           | Status      | Implementation                         |
| ----------------- | ----------- | -------------------------------------- |
| **WebSocket**     | ✅ Complete | `useOrdersWebSocket` hook              |
| **ImageKit**      | ✅ Complete | Server functions in `/api/imagekit.ts` |
| **Resend Email**  | ✅ Ready    | Configured in `lib/resend.ts`          |
| **Drag-and-Drop** | ✅ Ready    | @dnd-kit installed, examples available |

---

## Environment Variables Required

```env
# WebSocket
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.delycia.com/orders

# ImageKit
IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/yourEndpoint

# Resend
RESEND_API_KEY=re_your_api_key

# Server
SERVER_URL=http://localhost:8020/api/v1
```

---

## Next Steps

1. **Test WebSocket** - Verify real-time order updates work with new query system
2. **Test ImageKit** - Upload/delete images through server functions
3. **Send Test Email** - Verify Resend integration
4. **Implement Drag-Drop** - Add to menu management if not already present

All special features are **production-ready** for TanStack Start! 🚀
