import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ItemCustomization from './ItemCustomization'
import { Item, Variant } from '@/types/menu.types'

interface InventoryItemRowProps {
  item: Item
  variants: Variant[]
  getQuantity: (itemId: string, variant?: Variant) => number
  onUpdateQuantity: (
    itemId: string,
    change: number,
    itemData?: Item,
    variant?: Variant,
  ) => void
  onAddItem: (item: Item, variant?: Variant, addons?: any[]) => void
  isLast: boolean
  highlightedItemId: string | null
}

export default function InventoryItemRow({
  item,
  variants,
  getQuantity,
  onUpdateQuantity,
  onAddItem,
  isLast,
  highlightedItemId,
}: InventoryItemRowProps) {
  const isHighlighted = highlightedItemId === item.id
  const hasVariants = variants.length > 0

  const AddButton = ({ onClick }: { onClick?: () => void }) => (
    <Button
      size="sm"
      className="text-sm px-4 w-full transition-none!"
      onClick={onClick}
    >
      Add
    </Button>
  )

  return (
    <div>
      {/* Main Item */}
      <div
        className={`p-4 flex items-center gap-4 transition-all rounded-md duration-200 ${
          isHighlighted ? 'item-highlight-blink' : ''
        } ${
          // OOS Styles
          item.stock !== undefined && item.stock !== null && item.stock <= 0
            ? 'opacity-60 grayscale bg-gray-50'
            : ''
        }`}
      >
        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              {item.name}
            </h3>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ₹{item.price.toFixed(2)} {hasVariants ? '(Full)' : 'each'}
          </p>
          {hasVariants && (
            <p className="text-xs text-gray-500">
              {variants.length} variant{variants.length > 1 ? 's' : ''}{' '}
              available
            </p>
          )}
        </div>

        {/* Quantity Controls for Main Item */}
        <div className="flex items-center gap-4 transition-none!">
          {getQuantity(item.id) > 0 ? (
            <div className="transition-none! flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-none!"
                onClick={() => onUpdateQuantity(item.id, -1, item)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">
                {getQuantity(item.id)}
              </span>
              <Button
                disabled={
                  item.stock ? getQuantity(item.id) === item.stock : false
                }
                variant="ghost"
                size="icon"
                className="h-8 w-8 transition-none!"
                onClick={() => onUpdateQuantity(item.id, 1, item)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-right min-w-[80px] transition-none!">
              {/* Check OOS before showing Add buttons */}
              {item.stock !== undefined &&
              item.stock !== null &&
              item.stock <= 0 ? (
                <Button
                  size="sm"
                  disabled
                  className="text-xs px-2 w-full opacity-70 cursor-not-allowed"
                >
                  Out of Stock
                </Button>
              ) : !hasVariants ? (
                <AddButton onClick={() => onAddItem(item)} />
              ) : (
                <ItemCustomization
                  item={item}
                  variants={variants}
                  onAddItem={onAddItem}
                >
                  <Button
                    size="sm"
                    className="text-sm px-4 w-full transition-none!"
                  >
                    Add
                  </Button>
                </ItemCustomization>
              )}
            </div>
          )}
        </div>
      </div>

      {!isLast && <Separator />}
    </div>
  )
}
