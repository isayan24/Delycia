import React from 'react'
import { CategoryItem } from './CategoryItem'
import { CompactCategoryItem } from './CompactCategoryItem'
import AddCategory from './AddCategory'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { FolderOpen, Plus } from 'lucide-react'
import { useMenuStore } from '@/store/useMenuStore'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCategoriesQuery } from '@/hooks/queries'

interface CategoryListProps {
  orientation?: 'vertical' | 'horizontal'
}

export const CategoryList = React.memo(
  ({ orientation = 'vertical' }: CategoryListProps) => {
    const { selectedRid } = useRestaurantSelector()
    const { data: categoriesData } = useCategoriesQuery(selectedRid)
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
        <div className="p-2 px-3 border-b rounded-t-md border-gray-200 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-green-600" />
                Categories
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {categories.length} total categories
              </p>
            </div>
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <AddCategory />
            </div>
          </div>
        </div>

        {/* Categories List */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-2">
            {categories.length > 0 ? (
              <div className="space-y-2">
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
