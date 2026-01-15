import { z } from "zod";

/**
 * Zod schema for addon form validation
 * Used for create/edit addon forms in the UI
 */
export const addonSchema = z.object({
  name: z
    .string()
    .min(1, "Addon name is required")
    .max(100, "Addon name must be less than 100 characters"),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .min(0, "Price must be positive")
    .max(99999, "Price is too high"),
  is_active: z.number().int().min(0).max(1).default(1),
});

/**
 * Zod schema for bulk CSV import with type transform
 */
export const addonBulkImportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.preprocess(
    (val) => {
      if (typeof val === "string") return parseFloat(val);
      return val;
    },
    z.number().min(0, "Price must be positive")
  ),
  is_active: z.preprocess((val) => {
    if (val === undefined || val === "") return 1; // Treat empty/undefined as default 1
    if (typeof val === "string") return parseInt(val, 10);
    return val;
  }, z.number().int().min(0).max(1)),
});

export type AddonFormData = z.infer<typeof addonSchema>;
export type AddonBulkImportData = z.infer<typeof addonBulkImportSchema>;
