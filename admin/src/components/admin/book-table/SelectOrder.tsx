import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useCategoriesQuery } from '@/hooks/queries'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useEffect, useState, useMemo } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'
import OrderHeader from './OrderHeader'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import InventoryItemRow from './InventoryItemRow'
import { Category, Item, Variant } from '@/types/menu.types'
import { motion, AnimatePresence } from 'motion/react'
import { useScrollHide } from '@/hooks/use-scroll-hide'

export default function SelectOrder() {
  const {
    quantities,
    orderItems,
    categoryId,
    setCategoryId,
    changeState,
    updateQuantity,
    getTotalAmount,
    highlightedItemId,
    highlightTimestamp,
    clearHighlight,
  } = useTableStore()

  const { selectedRid } = useRestaurantSelector()
  const isHidden = useScrollHide()

  const { data: categoriesData } = useCategoriesQuery(selectedRid)

  const [allItems, setAllItems] = useState<Item[]>([])

  const {
    items,
    error,
    allItems: allItemsFromApi,
  } = useInventoryItems(categoryId)

  const categories = useMemo(() => {
    if (!categoriesData?.categories || allItemsFromApi.length === 0) {
      return []
    }

    const categoryIdsInItems = [
      ...new Set(
        allItemsFromApi.map((item) => item.category_id).filter(Boolean),
      ),
    ]

    return categoriesData.categories.filter((category: any) =>
      categoryIdsInItems.includes(category.id),
    )
  }, [categoriesData, allItemsFromApi])

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId, setCategoryId])

  useEffect(() => {
    if (items.length > 0) {
      setAllItems((prev) => {
        const existingItemsMap = new Map(prev.map((item) => [item.id, item]))
        items.forEach((item) => {
          existingItemsMap.set(item.id, item)
        })
        return Array.from(existingItemsMap.values())
      })
    }
  }, [items])

  useEffect(() => {
    if (highlightedItemId && highlightTimestamp) {
      const timer = setTimeout(() => {
        clearHighlight()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [highlightedItemId, highlightTimestamp, clearHighlight])

  useEffect(() => {
    return () => {
      if (highlightedItemId) {
        clearHighlight()
      }
    }
  }, [highlightedItemId, clearHighlight])

  const handleQuantityUpdate = (
    itemId: string,
    change: number,
    itemData?: Item,
    variant?: Variant,
  ) => {
    const uniqueId = variant ? `${itemId}_variant_${variant.id}` : itemId
    const currentItem =
      itemData ||
      items.find((item) => item.id === itemId) ||
      allItems.find((item) => item.id === itemId)

    if (currentItem) {
      const modifiedItem = variant
        ? {
            ...currentItem,
            id: uniqueId,
            name: `${currentItem.name} - ${variant.name}`,
            price: variant.price,
          }
        : currentItem

      updateQuantity(uniqueId, change, modifiedItem)
    }
  }

  const getQuantity = (itemId: string, variant?: Variant) => {
    const uniqueId = variant ? `${itemId}_variant_${variant.id}` : itemId
    return quantities[uniqueId] || 0
  }

  // Unified Add Item Handler
  const onAddItem = (item: Item, variant?: Variant, addons: any[] = []) => {
    let uniqueId = variant ? `${item.id}_variant_${variant.id}` : item.id
    let finalPrice = variant ? variant.price : item.price
    let finalName = variant ? `${item.name} - ${variant.name}` : item.name

    if (addons.length > 0) {
      const sortedAddonIds = addons
        .map((a) => a.id)
        .sort()
        .join('_')
      uniqueId = `${uniqueId}_addons_${sortedAddonIds}`

      const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0)
      finalPrice += addonsPrice

      const addonNames = addons.map((a) => a.name).join(', ')
      finalName = `${finalName} (+ ${addonNames})`
    }

    const modifiedItem = {
      ...item,
      id: uniqueId,
      name: finalName,
      price: finalPrice,
      isVariant: !!variant,
      variantId: variant?.id,
      addons: addons,
    }

    updateQuantity(uniqueId, 1, modifiedItem)
  }

  const totalAmount = getTotalAmount()

  const handleSubmitOrder = () => {
    changeState(2)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-destructive">{error} Please try again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-fulls overflow-hidden relative max-w-4xl mx-auto bg-[#fcfcfd] dark:bg-gray-950">
      <header className="py-4 px-4 border-b border-gray-100 dark:border-gray-800 flex-none bg-white dark:bg-gray-900">
        <OrderHeader />
      </header>

      <Tabs value={categoryId} className="flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4">
          <TabsList className="bg-transparent! h-auto py-2 overflow-auto w-full rounded-none justify-start gap-1 flex-none">
            {categories.length > 0 &&
              categories.map((category: Category) => (
                <TabsTrigger
                  value={category.id}
                  key={category.id}
                  onClick={() => setCategoryId(category.id)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  {category.name}
                </TabsTrigger>
              ))}
          </TabsList>
        </div>

        {categories.map((category: Category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="mt-0 px-4 py-4 overflow-y-auto flex-1 h-full"
          >
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">
                  No items available in this category
                </p>
              </div>
            ) : (
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                {items.map((item: Item, index) => {
                  return (
                    <InventoryItemRow
                      key={item.id}
                      item={item}
                      getQuantity={getQuantity}
                      onUpdateQuantity={handleQuantityUpdate}
                      onAddItem={onAddItem}
                      isLast={index === items.length - 1}
                      highlightedItemId={highlightedItemId}
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Fixed Footer — hides/shows with MobileDock on scroll */}
      <AnimatePresence>
        {orderItems.length > 0 && !isHidden && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 150,
              mass: 1.5,
              opacity: { duration: 0.2 },
            }}
            className="fixed bottom-[110px] max-[540px]:bottom-[75px] min-[900px]:bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[500px] z-50"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Order Summary
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {orderItems.length} item{orderItems.length > 1 ? 's' : ''}{' '}
                    selected
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black max-[500px]:text-lg text-gray-900 dark:text-white tracking-tight">
                    ₹{totalAmount}
                  </p>
                </div>
              </div>

              <Button
                className="w-full rounded-xl h-12 text-base font-bold shadow-lg"
                size="lg"
                onClick={handleSubmitOrder}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Order ({orderItems.length} items)
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
