import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useCategoriesQuery } from '@/hooks/queries'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useEffect, useState, useMemo } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useTableStore } from '@/store/useTableStore'
import OrderHeader from './OrderHeader'
import axiosInstance from '@/lib/axios'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import InventoryItemRow from './InventoryItemRow'
import { Category, Item, Variant } from '@/types/menu.types'

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

  const { data: categoriesData } = useCategoriesQuery(selectedRid)

  const [allItems, setAllItems] = useState<Item[]>([])
  const [variants, setVariants] = useState<Record<string, Variant[]>>({})

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
    const fetchVariantsForCategory = async () => {
      if (items.length === 0) return

      try {
        const variantPromises = items.map(async (item) => {
          try {
            const response = await axiosInstance.get(
              `/variants?inventory_id=${item.id}`,
            )
            return { itemId: item.id, variants: response.data?.variants || [] }
          } catch (error) {
            console.error(
              `Failed to fetch variants for item ${item.id}:`,
              error,
            )
            return { itemId: item.id, variants: [] }
          }
        })

        const variantResults = await Promise.all(variantPromises)

        setVariants((prev) => {
          const newVariants = { ...prev }
          variantResults.forEach(({ itemId, variants: itemVariants }) => {
            newVariants[itemId] = itemVariants
          })
          return newVariants
        })
      } catch (error) {
        console.error('Error fetching variants:', error)
      }
    }

    fetchVariantsForCategory()
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
    <div className="overflow-x-hidden relative max-w-4xl mx-auto">
      <header className="py-4 px-1 border-b">
        <OrderHeader />
      </header>

      <Tabs value={categoryId} className="px-5s">
        <TabsList className="bg-white! mb-4 overflow-auto w-full rounded-none justify-start text-sm">
          {categories.length > 0 &&
            categories.map((category: Category) => (
              <TabsTrigger
                value={category.id}
                key={category.id}
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </TabsTrigger>
            ))}
        </TabsList>

        {categories.map((category: Category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className={`mt-0 p-2 overflow-y-auto ${
              orderItems.length > 0
                ? 'h-[calc(100vh-25rem)]'
                : 'h-[calc(100vh-15rem)] max-[500px]:pb-8'
            }`}
          >
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No items available in this category
                </p>
              </div>
            ) : (
              <div className="space-y-0 border rounded-md shadow-sm">
                {items.map((item: Item, index) => {
                  return (
                    <InventoryItemRow
                      key={item.id}
                      item={item}
                      variants={variants[item.id] || []}
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

      {/* Order Summary and Add to Order Button */}
      {orderItems.length > 0 && (
        <div className="fixed max-[500px]:bottom-12 bottom-4 w-full bg-white dark:bg-gray-900 border-t p-4 mt-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {orderItems.length} item{orderItems.length > 1 ? 's' : ''}{' '}
                  selected
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{totalAmount}</p>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleSubmitOrder}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Order ({orderItems.length} items)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
