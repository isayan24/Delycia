import React from 'react'
import { Category } from '@/types/menu.types'
import { CategoryDropdownMenu } from './CategoryDropdownMenu'
import { OptimizeImageLoader } from '@/components/smallComponents/OptimizeImageLoader'
import { ImageIcon } from 'lucide-react'
import { useInventoryItems } from '@/hooks/useInventoryItems'

interface CategoryItemProps {
  category: any
  isSelected: boolean
  onSelect: (category: Category) => void
  onEdit: (category: Category) => void
  onAddItem: (category: Category) => void
  onDelete: (category: Category) => void
  isHighlighted?: boolean
}

export const CategoryItem = React.memo(function CategoryItem({
  category,
  isSelected,
  onSelect,
  onEdit,
  onAddItem,
  onDelete,
  isHighlighted = false,
}: CategoryItemProps) {
  const { items } = useInventoryItems(category.id)

  return (
    <div
      id={`category-${category.id}`}
      onClick={() => onSelect(category)}
      className={`group relative transition-all duration-300 ease-in-out rounded-xl cursor-pointer border-2 ${
        isHighlighted
          ? 'bg-gradient-to-r from-orange-50 to-white border-orange-400 shadow-lg animate-pulse'
          : isSelected
            ? 'bg-white border-green-500 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-green-100'
            : 'bg-white border-transparent hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Category Image */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors duration-300 ${
                isSelected ? 'border-green-100' : 'border-gray-100'
              } shadow-sm bg-gray-50`}
            >
              {category.img ? (
                <OptimizeImageLoader
                  src={category.img}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="object-cover !w-full !h-full transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm shadow-green-200"></div>
            )}
          </div>

          {/* Category Details */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-bold text-base transition-colors duration-200 ${
                isSelected
                  ? 'text-gray-900'
                  : 'text-gray-700 group-hover:text-gray-900'
              } truncate`}
            >
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {items?.length || 0} items
              </span>
              {category.isActive && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    Active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div
          className="flex-shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <CategoryDropdownMenu
            category={category}
            onEdit={onEdit}
            onAddItem={onAddItem}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  )
})

CategoryItem.displayName = 'CategoryItem'
