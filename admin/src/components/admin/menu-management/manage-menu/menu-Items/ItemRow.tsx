import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Item } from '@/types/menu.types'
import { ItemDropdownMenu } from './navigation/ItemDropdownMenu'
import { IndianRupee, Settings, ImageIcon, Star } from 'lucide-react'
import { OptimizeImageLoader } from '@/components/smallComponents/OptimizeImageLoader'

interface ItemRowProps {
  item: Item | any
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  isHighlighted?: boolean
}

export const ItemRow = React.memo<ItemRowProps>(
  ({ item, onEdit, onDelete, isHighlighted = false }) => {
    return (
      <Card
        id={`item-${item.id}`}
        className={`group transition-all duration-500 overflow-hidden border-2 ${
          isHighlighted
            ? 'border-orange-400 bg-orange-50/50 shadow-xl animate-pulse'
            : 'border-gray-100 hover:border-green-100 bg-white hover:shadow-xl hover:shadow-green-50/30'
        } rounded-xl`}
      >
        <CardContent className="p-3 md:p-3.5">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Item Image */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-gray-50 shadow-sm bg-gray-50">
                {item?.images && item.images.length > 0 ? (
                  <OptimizeImageLoader
                    src={item.images[0]}
                    alt={item.name}
                    className="object-cover !w-full !h-full transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <ImageIcon className="w-8 h-8 text-gray-200" />
                  </div>
                )}
              </div>

              {/* Rating Badge */}
              {item.rating && (
                <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-green-100 border-2 border-white">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {item.rating}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0 py-0.5">
              <div className="flex items-start justify-between h-full">
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-1.5">
                  <div className="space-y-0.5">
                    <h3 className="md:text-lg font-[560] text-gray-900 truncate group-hover:text-green-600 transition-colors duration-300 tracking-tight">
                      {item.name}
                    </h3>

                    {/* Price and Tags */}
                    <ItemPriceAndTags item={item} />
                  </div>

                  {/* Availability Status */}
                  <ItemStatus status={item.status} />
                </div>

                {/* Action Menu */}
                <div className="shrink-0 transition-all duration-300 ml-2 group-hover:scale-110">
                  <ItemDropdownMenu
                    item={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

const ItemPriceAndTags = ({ item }: { item: any }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <div className="flex items-center text-lg md:text-xl font-[530] text-gray-900">
        <IndianRupee className="w-3.5 h-3.5 md:w-4 h-4 mr-0.5" />
        {item.price}
      </div>

      <div className="flex items-center gap-1 border-l border-gray-100 pl-2 ml-1">
        <Badge
          variant="secondary"
          className="text-[9px] md:text-[10px] font-medium bg-green-50 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 rounded-lg flex items-center gap-1"
        >
          <Settings className="w-2.5 h-2.5" />
          Customizable
        </Badge>

        {item.is_veg ? (
          <Badge className="text-[9px] md:text-[10px] font-medium border-2 border-green-50 text-green-700 bg-white px-2 py-0.5 rounded-lg shadow-none">
            Veg
          </Badge>
        ) : (
          <Badge className="text-[9px] md:text-[10px] font-medium border-2 border-red-50 text-red-700 bg-white px-2 py-0.5 rounded-lg shadow-none">
            Non-Veg
          </Badge>
        )}
      </div>
    </div>
  )
}

const ItemStatus = ({ status }: { status: any }) => {
  const isAvailable = status === 'available'
  const isLowStock = status === 'low_stock'

  return (
    <div className="flex items-center gap-1.5 mt-auto">
      <div
        className={`w-1.5 h-1.5 rounded-full ring-2 ${
          isAvailable
            ? 'bg-green-500 ring-green-50'
            : isLowStock
              ? 'bg-yellow-400 ring-yellow-50'
              : 'bg-red-500 ring-red-50'
        }`}
      ></div>
      <span
        className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
          isAvailable
            ? 'text-green-600'
            : isLowStock
              ? 'text-yellow-600'
              : 'text-red-700'
        }`}
      >
        {status === 'available'
          ? 'Available'
          : status === 'low_stock'
            ? 'Low Stock'
            : 'Out of Stock'}
      </span>
    </div>
  )
}

ItemRow.displayName = 'ItemRow'
