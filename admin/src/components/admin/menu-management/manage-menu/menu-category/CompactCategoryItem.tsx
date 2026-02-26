import React from 'react'
import { Category } from '@/types/menu.types'
import { OptimizeImageLoader } from '@/components/smallComponents/OptimizeImageLoader'
import { ImageIcon, Edit, Trash2, PlusCircle, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface CompactCategoryItemProps {
  category: any
  isSelected: boolean
  onSelect: (category: Category) => void
  onEdit: (category: Category) => void
  onAddItem: (category: Category) => void
  onDelete: (category: Category) => void
  isHighlighted?: boolean
}

export const CompactCategoryItem = React.memo(function CompactCategoryItem({
  category,
  isSelected,
  onSelect,
  onEdit,
  onAddItem,
  onDelete,
  isHighlighted = false,
}: CompactCategoryItemProps) {
  const { items } = useInventoryItems(category.id)

  return (
    <div
      onClick={() => onSelect(category)}
      className={cn(
        'group relative flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 p-1.5 rounded-lg shrink-0 w-[72px]',
        isSelected ? '' : 'opacity-80 hover:opacity-100',
        isHighlighted && 'ring-2 ring-orange-400 bg-orange-50',
      )}
    >
      {/* Action Menu (Overlay) */}
      <div className="absolute top-0 right-0 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="h-5 w-5 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 text-gray-500 hover:text-gray-900 hover:bg-white transition-colors"
          >
            <MoreVertical className="w-3 h-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddItem(category)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
              Delete Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Wrapper */}
      <div className="relative">
        <div
          className={cn(
            'w-14 h-14 rounded-full overflow-hidden border-2 shadow-sm transition-all',
            isSelected
              ? 'border-green-500 ring-2 ring-green-100'
              : 'border-gray-200',
          )}
        >
          {category.img ? (
            <OptimizeImageLoader
              src={category.img}
              alt={category.name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Item Count Badge */}
        <Badge
          variant="secondary"
          className="absolute -top-1 -left-1 h-4 min-w-4 px-1 flex items-center justify-center text-[9px] bg-white border border-gray-200 shadow-sm text-gray-700 z-10 rounded-full"
        >
          {items?.length || 0}
        </Badge>
      </div>

      {/* Name */}
      <span
        className={cn(
          'text-[10px] text-center font-medium line-clamp-2 leading-tight px-1',
          isSelected ? 'text-green-700 font-bold' : 'text-gray-600',
        )}
      >
        {category.name}
      </span>

      {/* Selection Indicator Dot */}
      {isSelected && (
        <div className="w-1 h-1 rounded-full bg-green-500 mt-0.5" />
      )}
    </div>
  )
})

CompactCategoryItem.displayName = 'CompactCategoryItem'
