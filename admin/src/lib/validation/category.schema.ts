import { z } from "zod";

// Base schemas
const baseTokenSchema = z.object({
  accessToken: z.string().min(1, "Access token is required")
});

const baseCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  img: z.string().url("Invalid image URL").optional().or(z.literal(""))
});

// Specific validation schemas
export const createCategorySchema = baseCategorySchema.merge(baseTokenSchema);

export const updateCategorySchema = baseCategorySchema.merge(baseTokenSchema).extend({
  categoryId: z.number().positive("Invalid category ID")
});

export const deleteCategorySchema = baseTokenSchema.extend({
  categoryId: z.number().positive("Invalid category ID")
});

// Types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;