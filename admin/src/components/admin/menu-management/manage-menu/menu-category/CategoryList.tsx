import React from 'react'
import { CategoryItem } from './CategoryItem'
import { CompactCategoryItem } from './CompactCategoryItem'
import AddCategory from './AddCategory'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { useAdminAuthQuery } from '@/hooks/queries/useAdminAuthQuery'
import { useMenuStore } from '@/store/useMenuStore'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCategoriesQuery } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryListProps {
  orientation?: 'vertical' | 'horizontal'
}

export const CategoryList = React.memo(
  ({ orientation = 'vertical' }: CategoryListProps) => {
    const { isLoading: isAuthLoading } = useAdminAuthQuery()
    const { selectedRid } = useRestaurantSelector()
    const { data: categoriesData, isLoading: isQueryLoading } =
      useCategoriesQuery(selectedRid)

    const isLoading = isAuthLoading || isQueryLoading
    const categories = categoriesData?.categories || []

    const {
      selectedCategoryId,
      highlightedItemId,
      highlightedItemType,
      selectCategory,
      openEditCategoryDialog,
      openAddItemDialog,
      openDeleteCategoryDialog,
    } = useMenuStore()

    if (orientation === 'horizontal') {
      return (
        <div className="w-full bg-white border-b shadow-sm">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-start gap-1 p-2">
              {/* Compact Add Button */}
              <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0 w-[72px]">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden">
                  <AddCategory
                    trigger={<Plus className="w-5 h-5 text-gray-400" />}
                  />
                </div>
                <span className="text-[10px] text-center text-gray-500 font-medium">
                  Add New
                </span>
              </div>

              {categories.map((category: any) => (
                <CompactCategoryItem
                  key={category.id}
                  category={category}
                  isSelected={
                    category?.id ? selectedCategoryId === category.id : false
                  }
                  onSelect={selectCategory}
                  onEdit={openEditCategoryDialog}
                  onAddItem={openAddItemDialog}
                  onDelete={openDeleteCategoryDialog}
                  isHighlighted={
                    highlightedItemType === 'category' &&
                    highlightedItemId === category.id
                  }
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
          </ScrollArea>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-green-600" />
                </div>
                Categories
              </h2>
              <p className="text-sm text-gray-500 font-medium ml-1">
                {categories.length} total categories
              </p>
            </div>
            <AddCategory
              trigger={
                <Button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 h-10 gap-2 shadow-sm transition-all active:scale-95">
                  <Plus className="w-4 h-4" />
                  <span className="font-semibold">Add Category</span>
                </Button>
              }
            />
          </div>
        </div>

        {/* Categories List */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
                  >
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((category: any) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    isSelected={
                      category?.id ? selectedCategoryId === category.id : false
                    }
                    onSelect={selectCategory}
                    onEdit={openEditCategoryDialog}
                    onAddItem={openAddItemDialog}
                    onDelete={openDeleteCategoryDialog}
                    isHighlighted={
                      highlightedItemType === 'category' &&
                      highlightedItemId === category.id
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No categories yet
                </h3>
                <p className="text-gray-500 text-center text-sm mb-4">
                  Create your first category to start organizing your menu items
                </p>
                <AddCategory />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  },
)

CategoryList.displayName = 'CategoryList'
