import { formatImageToArrayString } from '@/helpers/image/formatImage'
import { ApiPayload, InventoryItem } from './types'

const normalizeStatus = (status: string): string => {
  if (typeof status === 'string' && status.includes(' ')) {
    return status.split(' ').join('_')
  }
  return status
}

// Helper function to determine if status should be auto-updated
const shouldAutoUpdateStatus = (
  currentStatus: string | undefined,
  newStock: number | undefined,
): boolean => {
  if (!currentStatus || newStock === undefined) return false

  const normalizedStatus = normalizeStatus(currentStatus.toLowerCase())
  const statusesToUpdate = ['out_of_stock', 'low_stock']

  return statusesToUpdate.includes(normalizedStatus) && newStock > 0
}

// Helper function to create request payload with selective field inclusion and auto status update
export const createPayload = (
  data: InventoryItem,
  includeImages: boolean = true,
  selectiveFields?: string[],
  currentStatus?: string,
): ApiPayload => {
  const {
    rid,
    id,
    name,
    description,
    categoryId,
    images,
    isVeg,
    cost,
    price,
    stock,
    status,
  } = data

  // Check if we need to auto-update status when stock is being updated
  let finalStatus = status
  let shouldIncludeStatusInPayload = false

  if (stock !== undefined && stock > 0 && currentStatus) {
    if (shouldAutoUpdateStatus(currentStatus, stock)) {
      finalStatus = 'available'
      shouldIncludeStatusInPayload = true
      console.log(
        `🔄 Auto-updating status from "${currentStatus}" to "available" due to stock update (${stock})`,
      )
    }
  }

  // If selective fields are specified, only include those fields
  if (selectiveFields && selectiveFields.length > 0) {
    const payload: Partial<ApiPayload> = {}

    // Only include id for PATCH requests
    if (id !== undefined && rid !== undefined) {
      payload.id = id
      payload.rid = rid
    }

    // Add only the specified fields
    selectiveFields.forEach((field) => {
      switch (field) {
        case 'name':
          if (name !== undefined) payload.name = name
          break
        case 'description':
          if (description !== undefined) payload.description = description
          break
        case 'category_id':
          if (categoryId !== undefined) payload.category_id = categoryId
          break
        case 'is_veg':
          if (isVeg !== undefined) payload.is_veg = isVeg
          break
        case 'cost':
          if (cost !== undefined) payload.cost = cost
          break
        case 'price':
          if (price !== undefined) payload.price = price
          break
        case 'stock':
          if (stock !== undefined) payload.stock = stock
          break
        case 'status':
          if (finalStatus !== undefined)
            payload.status = normalizeStatus(finalStatus)
          break
      }
    })

    // Auto-include status if it should be updated due to stock change
    if (shouldIncludeStatusInPayload && !selectiveFields.includes('status')) {
      payload.status = normalizeStatus(finalStatus)
    }

    // Handle images separately for selective updates
    if (includeImages && images && Array.isArray(images) && images.length > 0) {
      payload.images = formatImageToArrayString(images)
    }

    return payload as ApiPayload
  }

  // Original full payload logic for backward compatibility
  const payload: ApiPayload = {
    rid,
    name,
    description,
    category_id: categoryId,
    is_veg: isVeg,
    status: normalizeStatus(finalStatus),
    stock,
    price,
    cost,
  }

  // Only include images if explicitly requested and images are provided
  if (includeImages && images && Array.isArray(images) && images.length > 0) {
    payload.images = formatImageToArrayString(images)
  }

  // Only include id for PATCH requests
  if (id !== undefined) {
    payload.id = id
  }

  return payload
}
