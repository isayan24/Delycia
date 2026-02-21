import { memo, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { Item, Variant } from '@/types/menu.types'
import { ShoppingBag } from 'lucide-react'
import AddonSelector from './AddonSelector'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useInventoryVariantsQuery } from '@/hooks/queries/useInventoryQuery'
import { OptimizeImageLoader } from '@/components/smallComponents/OptimizeImageLoader'

interface MenuGridItemProps {
  item: Item
  quantity: number
  // Global customization state
  isCustomizing: boolean
  setCustomizingId: (id: string | null) => void
  onAddItem: (
    item: Item,
    variant?: Variant,
    addons?: any[],
    behavior?: 'add' | 'toggle',
  ) => void
}

// 1. Move ItemCard outside to prevent recreation on every render
const ItemCardView = ({
  item,
  quantity,
  isCustomizing,
  isOutOfStock,
  hasVariants,
  variantsCount,
  onClick,
}: {
  item: Item
  quantity: number
  isCustomizing: boolean
  isOutOfStock: boolean | null
  hasVariants: boolean
  variantsCount: number
  onClick?: () => void
}) => (
  <Card
    onClick={(e) => {
      if (isOutOfStock) {
        e.stopPropagation()
        return
      }
      onClick?.()
    }}
    className={cn(
      'group relative flex flex-col overflow-hidden shadow-sm transition-all duration-200 rounded-lg',
      'border',
      isOutOfStock
        ? 'cursor-not-allowed opacity-60 grayscale bg-gray-50 border-gray-100' // OOS Styles
        : 'hover:shadow-md cursor-pointer bg-white border-gray-200/60', // Normal Styles
      !isOutOfStock && (isCustomizing || quantity > 0)
        ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
        : !isOutOfStock && 'hover:border-primary/30',
      isCustomizing && !isOutOfStock && 'ring-1 ring-primary/50',
    )}
  >
    {quantity > 0 && !isOutOfStock && (
      <div className="absolute top-2 right-2 z-10 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        {quantity}
      </div>
    )}

    {/* Image Area */}
    <div className="relative aspect-10/8 overflow-hidden bg-gray-50 border-b border-gray-100/50">
      {item.img || (item.images && item.images.length > 0) ? (
        <OptimizeImageLoader
          src={item.img || item.images[0]}
          alt={item.name}
          loading="lazy"
          width="100%"
          height="100%"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground bg-slate-50">
          <ShoppingBag className="w-6 h-6 opacity-20 mb-1" />
          <span className="text-[10px] font-medium opacity-50">No Image</span>
        </div>
      )}

      {/* Veg/Non-Veg Indicator */}
      {item.is_veg !== undefined && item.is_veg !== null && (
        <div
          className={cn(
            'absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-sm border bg-white flex items-center justify-center shadow-sm',
            item.is_veg ? 'border-green-600' : 'border-red-600',
          )}
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              item.is_veg ? 'bg-green-600' : 'bg-red-600',
            )}
          />
        </div>
      )}

      {/* Out of Stock Standard Badge */}
      {isOutOfStock && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
          <span className="px-2 py-0.5 bg-gray-900/80 text-white text-[10px] font-bold rounded shadow-sm">
            Out of Stock
          </span>
        </div>
      )}
    </div>

    {/* Content Area */}
    <CardContent className="flex flex-col gap-1 p-2.5">
      <h3 className="font-semibold text-xs leading-tight text-gray-900 line-clamp-2 min-h-[2.5em] tracking-tight">
        {item.name}
      </h3>

      <div className="flex flex-wrap justify-between">
        <div className="font-bold text-sm text-gray-900">
          ₹{item.price || item.cost_price || 0}
        </div>
        <div>
          {hasVariants && (
            <span className="text-[10px] whitespace-nowrap text-muted-foreground bg-slate-200 px-1.5 py-0.5 rounded-full">
              {variantsCount} sizes
            </span>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const MenuGridItem = memo(function MenuGridItem({
  item,
  quantity,
  isCustomizing,
  setCustomizingId,
  onAddItem,
}: MenuGridItemProps) {
  // Fetch variants using the hook
  const { data: variants = [] } = useInventoryVariantsQuery(item.id)

  const hasVariants = variants.length > 0
  const isDesktop = useMediaQuery('(min-width: 500px)')

  const isOutOfStock =
    item.stock !== undefined && item.stock !== null && item.stock <= 0

  // Always include "Full" variant for clarity if variants exist
  const displayVariants = useMemo(
    () => [
      {
        id: 'original_full',
        name: 'Full',
        price: item.price || item.cost_price || 0,
        inventory_id: item.id,
      },
      ...variants,
    ],
    [item.id, item.price, item.cost_price, variants],
  )

  if (!hasVariants) {
    return (
      <div
        onClick={() =>
          !isOutOfStock && onAddItem(item, undefined, [], 'toggle')
        }
        className={isOutOfStock ? 'cursor-not-allowed' : ''}
      >
        <ItemCardView
          item={item}
          quantity={quantity}
          isCustomizing={isCustomizing}
          isOutOfStock={isOutOfStock}
          hasVariants={hasVariants}
          variantsCount={0}
        />
      </div>
    )
  }

  // Mobile Drawer
  if (!isDesktop) {
    return (
      <Drawer
        open={isCustomizing}
        onOpenChange={(isOpen) => {
          if (isOpen) setCustomizingId(item.id)
          else if (isCustomizing) setCustomizingId(null)
        }}
      >
        <DrawerTrigger asChild>
          <div>
            <ItemCardView
              item={item}
              quantity={quantity}
              isCustomizing={isCustomizing}
              isOutOfStock={isOutOfStock}
              hasVariants={hasVariants}
              variantsCount={variants.length + 1}
              onClick={() => setCustomizingId(item.id)}
            />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="hidden">Customize Item</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pt-2">
            <AddonSelector
              className="w-full"
              originalItemId={item.id}
              basePrice={item.price || item.cost_price || 0}
              variants={displayVariants}
              onAdd={(addons, selectedVariant) => {
                if (selectedVariant && selectedVariant.id === 'original_full') {
                  onAddItem(item, undefined, addons)
                } else {
                  onAddItem(item, selectedVariant, addons)
                }
              }}
              onCancel={() => setCustomizingId(null)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop Popover
  return (
    <Popover
      open={isCustomizing}
      onOpenChange={(isOpen) => {
        if (isOpen) setCustomizingId(item.id)
        else if (isCustomizing) setCustomizingId(null)
      }}
    >
      <PopoverTrigger asChild>
        <div>
          <ItemCardView
            item={item}
            quantity={quantity}
            isCustomizing={isCustomizing}
            isOutOfStock={isOutOfStock}
            hasVariants={hasVariants}
            variantsCount={variants.length + 1}
            onClick={() => setCustomizingId(item.id)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-auto"
        align="center"
        side="right"
        sideOffset={10}
      >
        <AddonSelector
          className="w-[300px]"
          originalItemId={item.id}
          basePrice={item.price || item.cost_price || 0}
          variants={displayVariants}
          onAdd={(addons, selectedVariant) => {
            if (selectedVariant && selectedVariant.id === 'original_full') {
              onAddItem(item, undefined, addons)
            } else {
              onAddItem(item, selectedVariant, addons)
            }
          }}
          onCancel={() => setCustomizingId(null)}
        />
      </PopoverContent>
    </Popover>
  )
})

export default MenuGridItem
