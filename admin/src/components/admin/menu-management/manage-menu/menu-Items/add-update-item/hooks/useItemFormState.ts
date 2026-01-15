import { useState, useCallback } from "react";
import type { Errors, ErrorField } from "../../types/addItemModal";

export interface ItemImage {
  id: string;
  image: string | null;
  previewImage: string | null;
  base64Data: string | null;
}

export interface BulkItemEntry {
  id: string;
  name: string;
  description: string;
  images: ItemImage[];
  price: number;
  cost: number;
  stock: number;
}

/**
 * Custom hook for managing bulk items state
 * Handles adding, removing, and updating bulk items
 */
export const useItemFormState = () => {
  const [bulkItems, setBulkItems] = useState<BulkItemEntry[]>([]);
  const [bulkErrors, setBulkErrors] = useState<{ [key: string]: Errors }>({});

  /**
   * Create a new empty bulk item
   */
  const createEmptyBulkItem = useCallback(
    (): BulkItemEntry => ({
      id: `bulk-item-${Date.now()}-${Math.random()}`,
      name: "",
      description: "",
      images: [],
      price: 0,
      cost: 0,
      stock: 100,
    }),
    []
  );

  /**
   * Add a new bulk item to the list
   */
  const handleAddBulkItem = useCallback(() => {
    setBulkItems((prev) => [...prev, createEmptyBulkItem()]);
  }, [createEmptyBulkItem]);

  /**
   * Remove a bulk item from the list
   */
  const handleRemoveBulkItem = useCallback((itemId: string) => {
    setBulkItems((prev) => prev.filter((item) => item.id !== itemId));
    setBulkErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[itemId];
      return newErrors;
    });
  }, []);

  /**
   * Update a field in a specific bulk item
   */
  const handleBulkItemChange = useCallback(
    (itemId: string, field: keyof BulkItemEntry, value: any) => {
      setBulkItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      );

      // Clear error for this field if it exists
      if (bulkErrors[itemId]?.[field as ErrorField]) {
        setBulkErrors((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], [field]: false },
        }));
      }
    },
    [bulkErrors]
  );

  /**
   * Reset bulk items to initial state
   */
  const resetBulkItems = useCallback(() => {
    setBulkItems([createEmptyBulkItem()]);
    setBulkErrors({});
  }, [createEmptyBulkItem]);

  /**
   * Initialize bulk items with one empty item
   */
  const initializeBulkItems = useCallback(() => {
    setBulkItems([createEmptyBulkItem()]);
  }, [createEmptyBulkItem]);

  return {
    bulkItems,
    bulkErrors,
    setBulkErrors,
    handleAddBulkItem,
    handleRemoveBulkItem,
    handleBulkItemChange,
    resetBulkItems,
    initializeBulkItems,
  };
};
