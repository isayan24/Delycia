import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
// import { fetchCategories } from "@/helpers/categories/fetchCategories"; // OLD - Replaced with TanStack Query
import { useCategoriesQuery } from '@/hooks/queries' // NEW - TanStack Query hook
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useEffect, useState, useMemo } from 'react'
import { Plus, Minus, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useTableStore } from '@/store/useTableStore'
import OrderHeader from './OrderHeader'
import axiosInstance from '@/lib/axios'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'

interface Category {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  category_id: string
  stock?: number
}

interface Variant {
  id: string
  name: string
  price: number
  inventory_id: string
}

interface OrderItem {
  item: InventoryItem
  quantity: number
  totalPrice: number
}

interface SelectOrderProps {
  onOrderSubmit?: (orderItems: OrderItem[]) => void
}

export default function SelectOrder({ onOrderSubmit }: SelectOrderProps) {
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

  // NEW - Use TanStack Query for categories 🚀
  const { data: categoriesData } = useCategoriesQuery(selectedRid)

  const [allItems, setAllItems] = useState<InventoryItem[]>([])
  const [variants, setVariants] = useState<Record<string, Variant[]>>({})
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const {
    items,
    loading,
    error,
    allItems: allItemsFromApi,
  } = useInventoryItems(categoryId)

  // NEW - Filter categories that have items using useMemo for optimization
  const categories = useMemo(() => {
    if (!categoriesData?.categories || allItemsFromApi.length === 0) {
      return []
    }

    // Get unique category IDs from items
    const categoryIdsInItems = [
      ...new Set(
        allItemsFromApi.map((item) => item.category_id).filter(Boolean),
      ),
    ]

    // Filter categories that exist in allItemsFromApi
    return categoriesData.categories.filter((category: any) =>
      categoryIdsInItems.includes(category.id),
    )
  }, [categoriesData, allItemsFromApi])

  // Set first available category as default
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId, setCategoryId])

  // Store all items from all categories
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

  // Fetch variants for all items in current category
  useEffect(() => {
    const fetchVariantsForCategory = async () => {
      if (items.length === 0) return

      try {
        // Fetch variants for all items in parallel
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

        // Update variants state
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

  // Handle animation cleanup after highlighting
  useEffect(() => {
    if (highlightedItemId && highlightTimestamp) {
      const timer = setTimeout(() => {
        clearHighlight()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [highlightedItemId, highlightTimestamp, clearHighlight])

  // Cleanup highlighting on component unmount
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
    itemData?: InventoryItem,
    variant?: Variant,
  ) => {
    // Create a unique key for variant items
    const uniqueId = variant ? `${itemId}_variant_${variant.id}` : itemId
    // Find the current item data
    const currentItem =
      itemData ||
      items.find((item) => item.id === itemId) ||
      allItems.find((item) => item.id === itemId)

    if (currentItem) {
      // Create modified item data for variants
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

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Get quantity for item or variant
  const getQuantity = (itemId: string, variant?: Variant) => {
    const uniqueId = variant ? `${itemId}_variant_${variant.id}` : itemId
    return quantities[uniqueId] || 0
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
        <TabsList className="!bg-white mb-4 overflow-auto w-full rounded-none justify-start text-sm">
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
                : 'h-[calc(100vh-15rem)] max-[768px]:pb-[2rem]'
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
                {items.map((item: InventoryItem, index) => {
                  const isHighlighted = highlightedItemId === item.id
                  const itemVariants = variants[item.id] || []
                  const hasVariants = itemVariants.length > 0
                  const isExpanded = expandedItems.has(item.id)

                  return (
                    <div key={item.id}>
                      {/* Main Item */}
                      <div
                        className={`p-4 flex items-center gap-4 transition-all rounded-md duration-200 ${
                          isHighlighted ? 'item-highlight-blink' : ''
                        }`}
                      >
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                              {item.name}
                            </h3>
                            {hasVariants && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleItemExpansion(item.id)}
                                className="p-1 h-6 w-6"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            ₹{item.price.toFixed(2)}{' '}
                            {hasVariants ? '(Full)' : 'each'}
                          </p>
                          {hasVariants && (
                            <p className="text-xs text-gray-500">
                              {itemVariants.length} variant
                              {itemVariants.length > 1 ? 's' : ''} available
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls for Main Item */}
                        <div className="flex items-center gap-4 !transition-none">
                          {getQuantity(item.id) ? (
                            <div className="!transition-none flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 !transition-none"
                                onClick={() =>
                                  handleQuantityUpdate(item.id, -1, item)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">
                                {getQuantity(item.id)}
                              </span>
                              <Button
                                disabled={
                                  item.stock
                                    ? getQuantity(item.id) === item.stock
                                    : false
                                }
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 !transition-none"
                                onClick={() =>
                                  handleQuantityUpdate(item.id, 1, item)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-right min-w-[80px] !transition-none">
                              <Button
                                size="sm"
                                className="text-sm px-4 w-full !transition-none"
                                onClick={() =>
                                  handleQuantityUpdate(item.id, 1, item)
                                }
                              >
                                Add
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* mark Variants Section */}
                      {hasVariants && isExpanded && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 border-t">
                          <div className="px-4 py-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                              Available Sizes:
                            </p>
                            <div className="space-y-2">
                              {itemVariants.map((variant) => (
                                <div
                                  key={variant.id}
                                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {variant.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      ₹{variant.price.toFixed(2)}
                                    </p>
                                  </div>

                                  {/* Variant Quantity Controls */}
                                  <div className="flex items-center gap-2">
                                    {getQuantity(item.id, variant) ? (
                                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            handleQuantityUpdate(
                                              item.id,
                                              -1,
                                              item,
                                              variant,
                                            )
                                          }
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-6 text-center font-semibold text-sm">
                                          {getQuantity(item.id, variant)}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          disabled={
                                            item.stock
                                              ? getQuantity(
                                                  item.id,
                                                  variant,
                                                ) === item.stock
                                              : false
                                          }
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            handleQuantityUpdate(
                                              item.id,
                                              1,
                                              item,
                                              variant,
                                            )
                                          }
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        className="text-xs px-3 py-1"
                                        onClick={() =>
                                          handleQuantityUpdate(
                                            item.id,
                                            1,
                                            item,
                                            variant,
                                          )
                                        }
                                      >
                                        Add
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {index < items.length - 1 && <Separator />}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Order Summary and Add to Order Button */}
      {orderItems.length > 0 && (
        <div className="fixed max-[768px]:bottom-[3rem] bottom-[1rem] w-full bg-white dark:bg-gray-900 border-t p-4 mt-6">
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
