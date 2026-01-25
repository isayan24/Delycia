import React, { useMemo } from 'react'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import DeleteItem from './navigation/DeleteItem'
import AddItemDetailsModal from './add-update-item/AddItemDetailsModal'
import { ItemRow } from './ItemRow'
import { CompactItemRow } from './CompactItemRow'
import UpdateItemDetailsModal from './add-update-item/UpdateItemDetails'
import { Plus, Package, ShoppingCart, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useMenuStore } from '@/store/useMenuStore'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCategoriesQuery } from '@/hooks/queries'
import { useMediaQuery } from '@/hooks/use-media-query'

export const ItemList = React.memo(() => {
  const { selectedRid } = useRestaurantSelector()

  // ✅ Read categories from TanStack Query (NOT Zustand!)
  const { data: categoriesData } = useCategoriesQuery(selectedRid)
  const categoriesFromQuery = categoriesData?.categories || []

  const {
    // State
    selectedCategoryId,
    selectedCategory,
    // categories removed - now using categoriesFromQuery from TanStack Query
    isAddItemDialogOpen,
    isDeleteItemDialogOpen,
    isEditItemDialogOpen,
    currentFoodItem,
    highlightedItemId,
    highlightedItemType,

    // Actions
    openAddItemDialog,
    closeAddItemDialog,
    openEditItemDialog,
    closeEditItemDialog,
    openDeleteItemDialog,
    closeDeleteItemDialog,
  } = useMenuStore()

  const { items, loading, error, refetch } =
    useInventoryItems(selectedCategoryId)

  const isDesktop = useMediaQuery('(min-width: 768px)')

  const itemList = useMemo(
    () =>
      items?.map((item: any) =>
        isDesktop ? (
          <ItemRow
            key={item.id}
            item={item}
            onEdit={openEditItemDialog}
            onDelete={openDeleteItemDialog}
            isHighlighted={
              highlightedItemType === 'inventory' &&
              highlightedItemId === item.id
            }
          />
        ) : (
          <CompactItemRow
            key={item.id}
            item={item}
            onEdit={openEditItemDialog}
            onDelete={openDeleteItemDialog}
            isHighlighted={
              highlightedItemType === 'inventory' &&
              highlightedItemId === item.id
            }
          />
        ),
      ),
    [
      items,
      openEditItemDialog,
      openDeleteItemDialog,
      highlightedItemId,
      highlightedItemType,
      isDesktop,
    ],
  )

  // Show placeholder when no category is selected
  if (!selectedCategoryId || !selectedCategory) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <ShoppingCart className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Category
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Choose a category from the left sidebar to view and manage its items
          </p>
        </div>
      </div>
    )
  }

  const itemCount = items?.length || 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-2 rounded-t-md md:p-6 md:pb-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {selectedCategory.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                <Badge variant="secondary" className="text-[10px] md:text-xs">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={() => openAddItemDialog(selectedCategory)}
            className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4 shrink-0"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
            <span className="md:hidden">Add New</span>
            <span className="hidden md:inline">Add New Item</span>
          </Button>
          {/* ✅ Removed Refresh Categories button - auto-updates via mutations */}
        </div>
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-2 md:p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border"
                >
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Items
              </h3>
              <p className="text-gray-500 text-center mb-4">{error}</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          ) : itemCount > 0 ? (
            <div className="space-y-3">{itemList}</div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Items Yet
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Start building your menu by adding items to this category
              </p>
              <Button
                onClick={() => openAddItemDialog(selectedCategory)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Item Dialog */}
      {isAddItemDialogOpen && selectedCategoryId && (
        <AddItemDetailsModal
          categories={categoriesFromQuery}
          categoryId={selectedCategoryId}
          open={isAddItemDialogOpen}
          onOpenChange={closeAddItemDialog}
          refetch={refetch}
        />
      )}

      {/* Edit Item Dialog */}
      {isEditItemDialogOpen && currentFoodItem && (
        <UpdateItemDetailsModal
          categories={categoriesFromQuery}
          currentFoodItem={currentFoodItem}
          categoryId={selectedCategoryId}
          open={isEditItemDialogOpen}
          onOpenChange={closeEditItemDialog}
          refetch={refetch}
        />
      )}

      {/* Delete Item Dialog */}
      {isDeleteItemDialogOpen && currentFoodItem && (
        <DeleteItem
          isOpen={isDeleteItemDialogOpen}
          onOpenChange={closeDeleteItemDialog}
          currentFoodItem={currentFoodItem}
          refetch={refetch}
        />
      )}
    </div>
  )
})

ItemList.displayName = 'ItemList'
