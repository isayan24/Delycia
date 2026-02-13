import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OptimizeImageLoader } from '@/components/smallComponents/OptimizeImageLoader'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash2, ImageIcon, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompactItemRowProps {
  item: any
  onEdit: (item: any) => void
  onDelete: (item: any) => void
  isHighlighted?: boolean
}

export const CompactItemRow = React.memo<CompactItemRowProps>(
  ({ item, onEdit, onDelete, isHighlighted = false }) => {
    return (
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-200 cursor-pointer border shadow-sm',
          isHighlighted
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-100 hover:border-gray-300',
        )}
      >
        <CardContent className="p-2 flex gap-3">
          {/* Image */}
          <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {item?.images && item.images.length > 0 ? (
              <OptimizeImageLoader
                src={item.images[0]}
                alt={item.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
            )}

            {/* veg/non-veg dot */}
            <div
              className={cn(
                'absolute top-1 left-1 w-3 h-3 rounded-sm border bg-white flex items-center justify-center shadow-sm',
                item.is_veg ? 'border-green-600' : 'border-red-600',
              )}
            >
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  item.is_veg ? 'bg-green-600' : 'bg-red-600',
                )}
              />
            </div>

            {/* Rating Badge */}
            {item.rating && (
              <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 border shadow-sm">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                {item.rating}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
                {item.name}
              </h3>

              {/* Menu Trigger */}
              <div className="shrink-0 -mr-1 -mt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="text-red-600 hover:text-red-600!"
                    >
                      <Trash2 className="w-4 h-4 mr-2 text-red-600" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="">
              <div className="flex items-baseline gap-1 text-green-700 font-bold text-base">
                <span className="text-xs">₹</span>
                {item.price}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    item.status === 'available' ? 'outline' : 'secondary'
                  }
                  className={cn(
                    'text-[10px] px-1.5 h-5 font-normal border-0',
                    item.status === 'available'
                      ? 'bg-green-50 text-green-700'
                      : item.status === 'low_stock'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700',
                  )}
                >
                  {item.status === 'available'
                    ? 'Available'
                    : item.status === 'low_stock'
                      ? 'Low Stock'
                      : 'Out of Stock'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

CompactItemRow.displayName = 'CompactItemRow'
