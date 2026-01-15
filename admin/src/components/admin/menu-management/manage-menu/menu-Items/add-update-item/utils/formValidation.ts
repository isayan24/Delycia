import { Errors } from "../../types/addItemModal";

/**
 * Validates single item form data
 */
export const validateSingleForm = (
  formData: {
    name: string;
    description: string;
    category_id: number;
    price: number;
    cost: number;
    stock: number;
  },
  itemImages: unknown[]
): Errors => {
  const errors: Errors = {};

  if (!formData.name.trim()) errors.name = true;
  if (!formData.description.trim()) errors.description = true;
  if (!formData.category_id) errors.category_id = true;
  if (itemImages.length === 0) errors.image = true;
  if (!formData.price || formData.price <= 0) errors.price = true;
  if (!formData.cost || formData.cost <= 0) errors.cost = true;
  if (!formData.stock || formData.stock <= 0) errors.stock = true;

  return errors;
};

/**
 * Validates bulk items form data
 */
export const validateBulkForm = (
  categoryId: number,
  bulkItems: Array<{
    name: string;
    description: string;
    images: unknown[];
    price: number;
    cost: number;
    stock: number;
  }>
): { errors: { [key: string]: Errors }; categoryError: boolean } => {
  const errors: { [key: string]: Errors } = {};
  let categoryError = false;

  // Validate category
  if (!categoryId) {
    categoryError = true;
  }

  // Validate each bulk item
  bulkItems.forEach((item, index) => {
    const itemId = `item-${index}`;
    const itemErrors: Errors = {};

    if (!item.name.trim()) itemErrors.name = true;
    if (!item.description.trim()) itemErrors.description = true;
    if (item.images.length === 0) itemErrors.image = true;
    if (!item.price || item.price <= 0) itemErrors.price = true;
    if (!item.cost || item.cost <= 0) itemErrors.cost = true;
    if (!item.stock || item.stock <= 0) itemErrors.stock = true;

    if (Object.keys(itemErrors).length > 0) {
      errors[itemId] = itemErrors;
    }
  });

  return { errors, categoryError };
};

/**
 * Get list of error field names for display
 */
export const getErrorFields = (errors: Errors): string[] => {
  const errorFields: string[] = [];

  if (errors.name) errorFields.push("Item Name");
  if (errors.description) errorFields.push("Description");
  if (errors.category_id) errorFields.push("Category");
  if (errors.image) errorFields.push("Item Photos");
  if (errors.price) errorFields.push("Price");
  if (errors.cost) errorFields.push("Cost");
  if (errors.stock) errorFields.push("Stock");

  return errorFields;
};
