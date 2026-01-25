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

interface MenuGridItemProps {
  item: Item
  variants: Variant[]
  cart: any[]
  // Global customization state
  isCustomizing: boolean
  setCustomizingId: (id: string | null) => void
  onAddItem: (item: Item, variant?: Variant, addons?: any[]) => void
}

export default function MenuGridItem({
  item,
  variants, // these are the specific variants for this item
  cart,
  isCustomizing,
  setCustomizingId,
  onAddItem,
}: MenuGridItemProps) {
  const hasVariants = variants.length > 0
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Check if stock is explicitly 0.
  // Assuming stock might be undefined/null effectively means in-stock unless strictly 0?
  // Or is it the other way? For now, we'll treat strictly 0 or less as OOS to be safe.
  // If stock property doesn't exist, we assume in stock for legacy items.
  const isOutOfStock =
    item.stock !== undefined && item.stock !== null && item.stock <= 0

  const itemQuantity = (cart || [])
    .filter(
      (c) => c.id === String(item.id) || c.id.startsWith(String(item.id) + '_'),
    )
    .reduce((sum, c) => sum + c.quantity, 0)

  // Always include "Full" variant for clarity if variants exist
  const displayVariants = [
    {
      id: 'original_full',
      name: 'Full',
      price: item.price || item.cost_price || 0,
      inventory_id: item.id,
    },
    ...variants,
  ]

  // Reusable Card Presentation
  const ItemCard = ({ onClick }: { onClick?: () => void }) => (
    <Card
      onClick={(e) => {
        if (isOutOfStock) {
          e.stopPropagation()
          return
        }
        onClick?.()
      }}
      className={cn(
        'group relative flex flex-col overflow-hidden shadow-sm transition-all duration-200',
        'border-2',
        isOutOfStock
          ? 'cursor-not-allowed opacity-60 grayscale bg-gray-50 border-gray-100' // OOS Styles
          : 'hover:shadow-md cursor-pointer bg-gray-100', // Normal Styles
        !isOutOfStock && (isCustomizing || itemQuantity > 0)
          ? 'border-primary bg-primary/5 ring-0'
          : !isOutOfStock &&
              'border-transparent ring-1 ring-slate-100 hover:ring-primary/20',
        isCustomizing && !isOutOfStock && 'ring-0',
      )}
    >
      {itemQuantity > 0 && !isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {itemQuantity}
        </div>
      )}

      {/* Image Area */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
        {item.img || (item.images && item.images.length > 0) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.img || item.images[0]}
            alt={item.name}
            className="h-full w-full object-cover "
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground bg-slate-50">
            <ShoppingBag className="w-8 h-8 opacity-20 mb-2" />
            <span className="text-xs font-medium opacity-50">No Image</span>
          </div>
        )}

        {/* Veg/Non-Veg Indicator */}
        <div className="absolute top-2 left-2">
          {item.is_veg === 1 ? (
            <div className="h-4 w-4 rounded-sm border border-green-600 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-green-600"></div>
            </div>
          ) : item.is_veg === 0 ? (
            <div className="h-4 w-4 rounded-sm border border-red-600 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-red-600"></div>
            </div>
          ) : null}
        </div>

        {/* Out of Stock Standard Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
            <span className="px-3 py-1 bg-gray-900/80 text-white text-xs font-bold rounded shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <CardContent className="flex flex-col gap-1 p-3">
        <h3 className="font-semibold text-sm leading-tight text-gray-900 line-clamp-2 min-h-[2em]">
          {item.name}
        </h3>

        <div className="flex flex-wrap justify-between">
          <div className="font-bold text-base text-primary">
            {hasVariants ? 'From ' : ''}₹{item.price || item.cost_price || 0}
          </div>
          <div>
            {hasVariants && (
              <span className="text-[10px] whitespace-nowrap text-muted-foreground bg-slate-200 px-1.5 py-0.5 rounded-full">
                {variants.length + 1} sizes
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!hasVariants) {
    return (
      <div
        onClick={() => !isOutOfStock && onAddItem(item)}
        className={isOutOfStock ? 'cursor-not-allowed' : ''}
      >
        <ItemCard />
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
            <ItemCard onClick={() => setCustomizingId(item.id)} />
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
          <ItemCard onClick={() => setCustomizingId(item.id)} />
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
}
