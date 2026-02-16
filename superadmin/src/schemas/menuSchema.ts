import { z } from 'zod'

/**
 * Menu item schema for creating and updating menu items
 */
export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .positive('Price must be a positive number')
    .or(z.string().transform((val) => parseFloat(val))),
  category_id: z
    .number()
    .int()
    .positive('Category is required')
    .or(z.string().transform((val) => parseInt(val, 10))),
  restaurant_id: z
    .number()
    .int()
    .positive('Restaurant is required')
    .or(z.string().transform((val) => parseInt(val, 10))),
  is_available: z
    .boolean()
    .optional()
    .default(true)
    .or(z.string().transform((val) => val === 'true')),
  image_url: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
})

export type MenuItemFormData = z.infer<typeof menuItemSchema>

/**
 * Menu category schema
 */
export const menuCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  restaurant_id: z
    .number()
    .int()
    .positive('Restaurant is required')
    .or(z.string().transform((val) => parseInt(val, 10))),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  display_order: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(z.string().transform((val) => parseInt(val, 10))),
})

export type MenuCategoryFormData = z.infer<typeof menuCategorySchema>

/**
 * Bulk update schema
 */
export const bulkUpdateMenuSchema = z.object({
  item_ids: z.array(z.number().int().positive()).min(1, 'Select at least one item'),
  updates: z.object({
    price: z.number().positive().optional(),
    is_available: z.boolean().optional(),
    category_id: z.number().int().positive().optional(),
  }),
})

export type BulkUpdateMenuData = z.infer<typeof bulkUpdateMenuSchema>
