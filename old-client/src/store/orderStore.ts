import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ItemState = {
  items: Item[];
  selectedItems: string[];
};

export type Item = {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: any;
  category?: string;
  quantity?: number;
  discount?: number;
  isVeg?: boolean;
  status?: string;
  variantId?: number;
};

export type ItemAction = {
  addItem: (item: Item) => void;
  removeItem: (id: string[]) => void;
  updateItem: (id: string, item: Item) => void;
  removeAllQuantity: (id: string) => void;
  updateSelectedItems: (ids: string[]) => void;
  clearAll: () => void; // New function to clear everything
};

export const useItemStore = create<ItemAction & ItemState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: [],
      
      addItem: (item: Item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
        
      removeItem: (ids: string[]) =>
        set((state) => ({
          items: state.items.filter((item) => !ids.includes(item.id)),
        })),
        
      // Remove all quantities of a specific item
      removeAllQuantity: (id: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
        
      // Update Item
      updateItem: (id: string, updatedItem: Item) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? updatedItem : item
          ),
        })),
        
      updateSelectedItems: (ids: string[]) =>
        set((state) => ({
          selectedItems: ids,
        })),
        
      // Clear all items and selected items from both state and localStorage
      clearAll: () => {
        set(() => ({
          items: [],
          selectedItems: [],
        }));
        // This will trigger the persist middleware to update localStorage automatically
      },
    }),
    {
      name: "item-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);