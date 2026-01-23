import { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'
import { Item, Variant } from '@/types/menu.types'
import LoadingScreen from '@/components/common/LoadingScreen'
import axiosInstance from '@/lib/axios'

interface MenuSectionProps {
  addToCart: (item: Item) => void
}

// Simple fuzzy search helper
const fuzzyMatch = (text: string, term: string) => {
  if (!term) return true
  const t = text.toLowerCase()
  const q = term.toLowerCase()

  // Direct inclusion
  if (t.includes(q)) return true

  // Basic character sequence matching
  let i = 0
  let j = 0
  while (i < t.length && j < q.length) {
    if (t[i] === q[j]) {
      j++
    }
    i++
  }
  return j === q.length
}

export default function MenuSection({ addToCart }: MenuSectionProps) {
  const { selectedRestaurant } = useRestaurantSelector()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [variants, setVariants] = useState<Record<string, Variant[]>>({})
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 🎯 Use TanStack Query for categories - automatic caching, loading, error handling!
  const {
    data: categoriesData,
    isLoading: loadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategoriesQuery(selectedRestaurant?.id)

  const categories = categoriesData?.categories || []

  // Fetch all items by passing undefined/null or handling it.
  // useInventoryItems(null) fetches all items for the restaurant.
  // We want all items here because we filter by category client-side
  // but also filter by category when a category is selected (visual filter).
  const { allItems, loading: loadingItems } = useInventoryItems(null)

  // Derived filtered items based on search OR category
  const filteredItems = useMemo(() => {
    let result = allItems

    // If there's a search query, filter all items by search query
    if (searchQuery.trim()) {
      result = allItems.filter((item) => fuzzyMatch(item.name, searchQuery))
    } else {
      // If no search query, filter by selected category (if not 'all')
      if (selectedCategoryId !== 'all') {
        result = result.filter(
          (item) => item.category_id === selectedCategoryId,
        )
      }
    }

    return result
  }, [allItems, selectedCategoryId, searchQuery])

  // Fetch variants for all filtered items
  useEffect(() => {
    const fetchVariantsForItems = async () => {
      if (filteredItems.length === 0) return

      try {
        // Fetch variants for all items in parallel
        const variantPromises = filteredItems.map(async (item) => {
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

    fetchVariantsForItems()
  }, [filteredItems])

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

  const handleAddToCart = (item: Item, variant?: Variant) => {
    if (variant) {
      // Create a modified item with variant info
      const modifiedItem: Item = {
        ...item,
        id: `${item.id}_variant_${variant.id}`,
        name: `${item.name} - ${variant.name}`,
        price: variant.price,
        variantId: variant.id,
      }
      addToCart(modifiedItem)
    } else {
      addToCart(item)
    }
  }

  if (categoriesError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-2">Failed to load categories</p>
        <button
          onClick={() => refetchCategories()}
          className="text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  // If no categories and not loading, show message
  // Only show after data has been fetched (categoriesData is defined)
  if (
    !loadingCategories &&
    !loadingItems &&
    categoriesData !== undefined &&
    categories.length === 0
  ) {
    return (
      <div className="p-4 text-center">
        No categories found. Please select a restaurant.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-3">
        <Tabs
          value={searchQuery ? 'all' : selectedCategoryId}
          onValueChange={(val) => {
            setSelectedCategoryId(val)
            // Clear search if changing category manually? Maybe better UX.
            if (val !== 'all' && searchQuery) setSearchQuery('')
          }}
          className="flex-1 w-full overflow-hidden"
        >
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="flex flex-nowrap overflow-x-auto">
              <TabsTrigger value="all" className="flex-shrink-0">
                All
              </TabsTrigger>
              {categories.map((cat: { id: string; name: string }) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex-shrink-0"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="flex-1 border rounded-md p-3">
        {loadingCategories || (loadingItems && allItems.length === 0) ? (
          <>
            <LoadingScreen message="Loading Inventory" />
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {filteredItems.map((item) => {
              const itemVariants = variants[item.id] || []
              const hasVariants = itemVariants.length > 0
              const isExpanded = expandedItems.has(item.id)

              return (
                <div key={item.id} className="flex flex-col">
                  {/* Main Item Card */}
                  <Card
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      hasVariants && isExpanded ? 'rounded-b-none' : ''
                    }`}
                    onClick={() => {
                      if (!hasVariants) {
                        handleAddToCart(item)
                      } else {
                        toggleItemExpansion(item.id)
                      }
                    }}
                  >
                    <CardContent className="p-2 flex flex-col items-center text-center gap-1">
                      <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                        {item.img || item.images?.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.img || item.images[0]}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="font-medium text-xs line-clamp-2 w-full">
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="font-bold text-green-600 text-sm">
                          ₹{item.price || item.cost_price || 0}
                        </div>
                        {hasVariants && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleItemExpansion(item.id)
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      {hasVariants && (
                        <p className="text-[10px] text-gray-500">
                          {itemVariants.length} size
                          {itemVariants.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Variant Options Dropdown */}
                  {hasVariants && isExpanded && (
                    <div className="bg-gray-50 border border-t-0 rounded-b-md p-2 space-y-1">
                      {itemVariants.map((variant) => (
                        <Button
                          key={variant.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(item, variant)
                          }}
                        >
                          <span>{variant.name}</span>
                          <span className="font-semibold text-green-600">
                            ₹{variant.price}
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {filteredItems.length === 0 &&
              !loadingItems &&
              !loadingCategories &&
              filteredItems !== undefined && (
                <div className="col-span-full text-center text-gray-500 py-10">
                  No items found.
                </div>
              )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
