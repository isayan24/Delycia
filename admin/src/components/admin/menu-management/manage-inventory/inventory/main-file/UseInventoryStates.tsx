// Updated UseInventoryStates.tsx with better accordion handling

import { create } from "zustand";

interface InventoryState {
  variableStockStatus: Record<string, boolean>; // Track stock status per category/item
  isRestockDialogOpen: boolean;
  currentVariableId: string | null;
  pendingStockUpdates: Set<string>; // Track categories pending stock activation
  currentVariableType: string | null;

  // New: Track category-to-items mapping
  categoryItemsMap: Record<string, string[]>; // categoryId -> itemIds[]

  // Search and Highlighting
  highlightedItemId: string | null;
  highlightedItemType: "category" | "inventory" | null;

  // Add accordion state management
  openAccordions: Set<string>; // Track which accordions are open

  // Actions
  handleRestockDialog: ({ variableId }: any) => void;
  handleStockSwitch: (
    variableId: string,
    variableStatus: boolean,
    variableType: string
  ) => void;
  setIsRestockDialogOpen: (value: boolean) => void;
  getVariableStockStatus: (
    variableId: string,
    variableStatus: boolean
  ) => boolean;
  setVariableId: (value: string | null) => void;

  // New actions for stock activation
  addPendingStockUpdate: (variableId: string) => void;
  removePendingStockUpdate: (variableId: string) => void;
  isPendingStockUpdate: (variableId: string) => boolean;
  updateVariableStockStatus: (variableId: string, newStatus: boolean) => void;

  // New: Cascade category changes to items
  updateCategoryItemsMap: (categoryId: string, itemIds: string[]) => void;
  cascadeCategoryStatusToItems: (
    categoryId: string,
    newStatus: boolean
  ) => void;

  // Accordion management
  openAccordion: (categoryId: string) => void;
  closeAccordion: (categoryId: string) => void;
  toggleAccordion: (categoryId: string) => void;
  isAccordionOpen: (categoryId: string) => boolean;

  // Search and Highlighting actions
  handleHighlightItem: (
    itemId: string,
    type: "category" | "inventory",
    categoryId?: string
  ) => void;
  handleNavigateToItem: (
    itemId: string,
    type: "category" | "inventory",
    categoryId?: string
  ) => void;
  clearHighlight: () => void;
}

const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  variableStockStatus: {},
  isRestockDialogOpen: false,
  currentVariableId: null,
  pendingStockUpdates: new Set(),
  currentVariableType: null,
  categoryItemsMap: {},
  openAccordions: new Set(),

  // Search and Highlighting initial state
  highlightedItemId: null,
  highlightedItemType: null,

  // Actions
  handleRestockDialog: (variableId: any) => {
    set({ isRestockDialogOpen: false });
  },

  // Enhanced stock switch function
  handleStockSwitch: (variableId, variableStatus, variableType) => {
    const currentStatus =
      get().variableStockStatus[variableId] ?? variableStatus;
    const newStatus = !currentStatus;

    // Set current category for tracking
    set({ currentVariableId: variableId });
    set({ currentVariableType: variableType });

    // If switching from out-of-stock to in-stock (false to true)
    if (!currentStatus && newStatus) {
      // Add to pending updates for the parent component to handle
      // Don't update UI immediately - wait for database success
      get().addPendingStockUpdate(variableId);
    } else if (currentStatus && !newStatus) {
      // If switching from in-stock to out-of-stock, open restock dialog
      // Don't update UI immediately - wait for calendar confirmation
      set({ isRestockDialogOpen: true });
    }
  },

  getVariableStockStatus: (variableId: string, variableStatus: boolean) => {
    return get().variableStockStatus[variableId] ?? variableStatus;
  },

  setIsRestockDialogOpen: (value: boolean) => {
    set({ isRestockDialogOpen: value });
  },

  setVariableId: (value: string | null) => {
    set({ currentVariableId: value });
  },

  // New methods for handling pending stock updates
  addPendingStockUpdate: (variableId: string) => {
    set((state) => ({
      pendingStockUpdates: new Set(state.pendingStockUpdates).add(variableId),
    }));
  },

  removePendingStockUpdate: (variableId: string) => {
    set((state) => {
      const newSet = new Set(state.pendingStockUpdates);
      newSet.delete(variableId);
      return { pendingStockUpdates: newSet };
    });
  },

  // pending status for the stock (when updating db)
  isPendingStockUpdate: (variableId: string) => {
    return get().pendingStockUpdates.has(variableId);
  },

  // Method to update category stock status after successful database operation
  updateVariableStockStatus: (variableId: string, newStatus: boolean) => {
    set((state) => ({
      variableStockStatus: {
        ...state.variableStockStatus,
        [variableId]: newStatus,
      },
    }));
  },

  // New: Update the mapping of category to its items
  updateCategoryItemsMap: (categoryId: string, itemIds: string[]) => {
    set((state) => ({
      categoryItemsMap: {
        ...state.categoryItemsMap,
        [categoryId]: itemIds,
      },
    }));
  },

  // New: Cascade category status changes to all its items
  cascadeCategoryStatusToItems: (categoryId: string, newStatus: boolean) => {
    const itemIds = get().categoryItemsMap[categoryId] || [];

    if (itemIds.length > 0) {
      set((state) => {
        const updatedStockStatus = { ...state.variableStockStatus };

        // Update all items in the category
        itemIds.forEach((itemId) => {
          updatedStockStatus[itemId] = newStatus;
        });

        return {
          variableStockStatus: updatedStockStatus,
        };
      });
    }
  },

  // Accordion management methods
  openAccordion: (categoryId: string) => {
    set((state) => ({
      openAccordions: new Set(state.openAccordions).add(categoryId),
    }));
  },

  closeAccordion: (categoryId: string) => {
    set((state) => {
      const newSet = new Set(state.openAccordions);
      newSet.delete(categoryId);
      return { openAccordions: newSet };
    });
  },

  toggleAccordion: (categoryId: string) => {
    const isOpen = get().isAccordionOpen(categoryId);
    if (isOpen) {
      get().closeAccordion(categoryId);
    } else {
      get().openAccordion(categoryId);
    }
  },

  isAccordionOpen: (categoryId: string) => {
    return get().openAccordions.has(categoryId);
  },

  // Enhanced search and highlighting handlers
  handleHighlightItem: (
    itemId: string,
    type: "category" | "inventory",
    categoryId?: string
  ) => {
    set({
      highlightedItemId: itemId,
      highlightedItemType: type,
    });

    // Scroll to the highlighted item after a short delay to ensure it's rendered
    setTimeout(() => {
      if (type === "category") {
        // For categories, scroll to the accordion trigger
        const categoryElement = document.getElementById(
          `inventory-category-${itemId}`
        );
        if (categoryElement) {
          categoryElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      } else if (type === "inventory") {
        // For inventory items, scroll to both category and item
        // First, scroll to the category if we have categoryId
        if (categoryId) {
          const categoryElement = document.getElementById(
            `inventory-category-${categoryId}`
          );
          if (categoryElement) {
            categoryElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }

        // Then scroll to the item (with additional delay if category was scrolled)
        const itemScrollDelay = categoryId ? 400 : 100;
        setTimeout(() => {
          const itemElement = document.getElementById(
            `inventory-item-${itemId}`
          );
          if (itemElement) {
            itemElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          } else {
            console.warn("Could not find inventory item element to scroll to", {
              itemId,
              categoryId,
              type,
            });
          }
        }, itemScrollDelay);
      }
    }, 100);

    // Clear highlight after 3 seconds
    setTimeout(() => {
      set({
        highlightedItemId: null,
        highlightedItemType: null,
      });
    }, 3000);
  },

  handleNavigateToItem: (
    itemId: string,
    type: "category" | "inventory",
    categoryId?: string
  ) => {
    if (type === "category") {
      // For categories, just highlight them
      get().handleHighlightItem(itemId, type);
    } else if (type === "inventory") {
      // For inventory items, ensure the accordion is open and then highlight
      if (categoryId) {
        // First, check if accordion is already open
        const isAlreadyOpen = get().isAccordionOpen(categoryId);

        if (!isAlreadyOpen) {
          // Open the accordion using our state management
          get().openAccordion(categoryId);
          console.log("Opened accordion for category", categoryId);
        }

        // Try multiple approaches to find and trigger the accordion
        let accordionOpened = false;

        // Approach 1: Try to find the accordion trigger by data attribute
        const accordionTrigger = document.querySelector(
          `[data-category-id="${categoryId}"]`
        );

        if (accordionTrigger && accordionTrigger instanceof HTMLElement) {
          // Check if we can determine if accordion is closed
          const accordionContent = document.querySelector(
            `[data-category-content="${categoryId}"]`
          );
          const isAccordionClosed =
            accordionContent &&
            accordionContent.getAttribute("data-state") === "closed";

          // If accordion appears closed or we can't determine state, try to open it
          if (isAccordionClosed || !isAlreadyOpen) {
            try {
              accordionTrigger.click();
              accordionOpened = true;
            } catch (error) {
              console.warn("Failed to click accordion trigger", error);
            }
          }
        }

        // Approach 2: If first approach failed, try to find by category card
        if (!accordionOpened) {
          const categoryCard = document.getElementById(
            `inventory-category-${categoryId}`
          );
          if (categoryCard) {
            const clickableHeader =
              categoryCard.querySelector(".cursor-pointer");
            if (clickableHeader && clickableHeader instanceof HTMLElement) {
              try {
                clickableHeader.click();
                accordionOpened = true;
              } catch (error) {
                console.warn("Failed to click category header", error);
              }
            }
          }
        }

        // If we still couldn't open the accordion, highlight the category instead
        if (!accordionOpened && !isAlreadyOpen) {
          console.warn(
            "Could not open accordion, highlighting category instead",
            {
              categoryId,
              itemId,
            }
          );

          // Highlight the entire category card with a special style for failed accordion opening
          const categoryCard = document.getElementById(
            `inventory-category-${categoryId}`
          );
          if (categoryCard) {
            // Add a pulsing border to indicate the category contains the searched item
            categoryCard.style.border = "3px solid #f97316"; // orange border
            categoryCard.style.borderRadius = "12px";
            categoryCard.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.3)";
            categoryCard.style.animation = "pulse 1.5s infinite";

            // Scroll to category
            categoryCard.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });

            // Remove highlighting after 4 seconds
            setTimeout(() => {
              categoryCard.style.border = "";
              categoryCard.style.borderRadius = "";
              categoryCard.style.boxShadow = "";
              categoryCard.style.animation = "";
            }, 4000);
          }

          return; // Exit early since we're highlighting category instead
        }

        // Highlight the item with appropriate delay
        const delay = accordionOpened ? 500 : 300;
        setTimeout(() => {
          get().handleHighlightItem(itemId, type, categoryId);
        }, delay);
      } else {
        // No category ID provided, just highlight the item
        get().handleHighlightItem(itemId, type);
      }
    }
  },

  clearHighlight: () => {
    set({
      highlightedItemId: null,
      highlightedItemType: null,
    });
  },
}));

export default useInventoryStore;
