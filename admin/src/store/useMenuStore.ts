import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Category, Item } from '@/types/menu.types'
import logger from '@/lib/logger-dynamic'

interface MenuState {
  // Categories (UI State Only - data comes from TanStack Query)
  selectedCategoryId: string | null
  selectedCategory: Category | null
  currentCategory: Category | null

  // Category Dialog States
  isEditCategoryDialogOpen: boolean
  isDeleteCategoryDialogOpen: boolean
  isAddItemDialogOpen: boolean

  // Item Dialog States
  isDeleteItemDialogOpen: boolean
  isEditItemDialogOpen: boolean
  currentFoodItem: any

  // Search and Highlighting
  highlightedItemId: string | null
  highlightedItemType: 'category' | 'inventory' | null

  // Loading states
  isLoading: boolean
  error: string | null
}

interface MenuActions {
  // Category actions (UI State Only)
  selectCategory: (category: Category) => void
  setCurrentCategory: (category: Category | null) => void
  clearSelection: () => void

  // Category dialog actions
  openEditCategoryDialog: (category: Category) => void
  closeEditCategoryDialog: () => void
  openDeleteCategoryDialog: (category: Category) => void
  closeDeleteCategoryDialog: () => void
  openAddItemDialog: (category: Category) => void
  closeAddItemDialog: () => void

  // Item dialog actions
  openEditItemDialog: (item: Item) => void
  closeEditItemDialog: () => void
  openDeleteItemDialog: (item: Item) => void
  closeDeleteItemDialog: () => void

  // Search and highlighting actions
  highlightItem: (
    itemId: string,
    type: 'category' | 'inventory',
    categoryId?: string,
  ) => void
  clearHighlight: () => void
  navigateToItem: (
    itemId: string,
    type: 'category' | 'inventory',
    categories?: Category[],
  ) => Promise<void>

  // Generic actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

type MenuStore = MenuState & MenuActions

const initialState: MenuState = {
  selectedCategoryId: null,
  selectedCategory: null,
  currentCategory: null,
  isEditCategoryDialogOpen: false,
  isDeleteCategoryDialogOpen: false,
  isAddItemDialogOpen: false,
  isDeleteItemDialogOpen: false,
  isEditItemDialogOpen: false,
  currentFoodItem: null,
  highlightedItemId: null,
  highlightedItemType: null,
  isLoading: false,
  error: null,
}

export const useMenuStore = create<MenuStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Category actions (UI State Only - data managed by TanStack Query)

      selectCategory: (category) =>
        set({
          selectedCategoryId: category.id,
          selectedCategory: category,
        }),

      setCurrentCategory: (category) => set({ currentCategory: category }),

      clearSelection: () =>
        set({
          selectedCategoryId: null,
          selectedCategory: null,
        }),

      // Category dialog actions
      openEditCategoryDialog: (category) =>
        set({
          isEditCategoryDialogOpen: true,
          currentCategory: category,
        }),

      closeEditCategoryDialog: () =>
        set({
          isEditCategoryDialogOpen: false,
          currentCategory: null,
        }),

      openDeleteCategoryDialog: (category) =>
        set({
          isDeleteCategoryDialogOpen: true,
          currentCategory: category,
        }),

      closeDeleteCategoryDialog: () =>
        set({
          isDeleteCategoryDialogOpen: false,
          currentCategory: null,
        }),

      openAddItemDialog: (category) =>
        set({
          isAddItemDialogOpen: true,
          currentCategory: category,
          selectedCategoryId: category.id,
          selectedCategory: category,
        }),

      closeAddItemDialog: () =>
        set({
          isAddItemDialogOpen: false,
        }),

      // Item dialog actions
      openEditItemDialog: (item) =>
        set({
          isEditItemDialogOpen: true,
          currentFoodItem: item,
        }),

      closeEditItemDialog: () =>
        set({
          isEditItemDialogOpen: false,
          currentFoodItem: null,
        }),

      openDeleteItemDialog: (item) =>
        set({
          isDeleteItemDialogOpen: true,
          currentFoodItem: item,
        }),

      closeDeleteItemDialog: () =>
        set({
          isDeleteItemDialogOpen: false,
          currentFoodItem: null,
        }),

      // Search and highlighting actions
      highlightItem: (itemId, type, categoryId) => {
        set({
          highlightedItemId: itemId,
          highlightedItemType: type,
        })

        // Scroll to the highlighted item after a short delay
        setTimeout(() => {
          if (type === 'category') {
            const categoryElement = document.getElementById(
              `category-${itemId}`,
            )
            if (categoryElement) {
              categoryElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
              })
            }
          } else if (type === 'inventory') {
            // Handle inventory item scrolling
            if (categoryId) {
              const categoryElement = document.getElementById(
                `category-${categoryId}`,
              )
              if (categoryElement) {
                categoryElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest',
                })
              }
            }

            const itemScrollDelay = categoryId ? 400 : 100
            setTimeout(() => {
              const itemElement = document.getElementById(`item-${itemId}`)
              if (itemElement) {
                itemElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest',
                })
              } else {
                logger.warn(
                  'Could not find inventory item element to scroll to',
                  {
                    itemId,
                    categoryId,
                    type,
                  },
                )
              }
            }, itemScrollDelay)
          }
        }, 100)

        // Clear highlight after 3 seconds
        setTimeout(() => {
          set({
            highlightedItemId: null,
            highlightedItemType: null,
          })
        }, 3000)
      },

      clearHighlight: () =>
        set({
          highlightedItemId: null,
          highlightedItemType: null,
        }),

      navigateToItem: async (itemId, type, categoriesParam) => {
        const { selectCategory, highlightItem } = get()

        try {
          const axiosInstance = (await import('@/lib/axios')).default
          let categories: Category[] = categoriesParam || []

          if (categories.length === 0) {
            try {
              // Fallback: try to fetch categories (might fail without rid)
              const categoriesResponse = await axiosInstance.get('/categories')

              categories = categoriesResponse.data?.categories || []
            } catch (error) {
              logger.debug('Failed to fetch categories fallback', { error })
            }
          }

          if (type === 'category') {
            const category = categories.find(
              (cat: Category) => cat.id === itemId,
            )
            if (category) {
              selectCategory(category)
            }
          } else if (type === 'inventory') {
            let foundCategory: Category | null = null

            for (const category of categories) {
              try {
                const response = await axiosInstance.get(
                  `/inventory?category_id=${category.id}`,
                )

                if (response.data && response.data.inventory) {
                  const itemExists = response.data.inventory.some(
                    (item: any) => item.id.toString() === itemId.toString(),
                  )

                  if (itemExists) {
                    foundCategory = category
                    break
                  }
                }
              } catch (error) {
                logger.debug('Error checking category for inventory item', {
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                  categoryId: category.id,
                  itemId,
                })
              }
            }

            if (foundCategory) {
              selectCategory(foundCategory)
            } else if (categories.length > 0) {
              foundCategory = categories[0]
              selectCategory(foundCategory)
            }

            // Highlight the item after category selection
            setTimeout(
              () => {
                highlightItem(itemId, type, foundCategory?.id)
              },
              type === 'inventory' ? 500 : 0,
            )
          }
        } catch (error) {
          logger.error('Error in navigateToItem', {
            error: error instanceof Error ? error.message : 'Unknown error',
            itemId,
            type,
          })
        }
      },

      // Generic actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'menu-store',
    },
  ),
)
