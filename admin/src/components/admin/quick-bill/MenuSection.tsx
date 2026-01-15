import React, { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'
import { Item } from '@/types/menu.types'

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

  if (loadingCategories) {
    return <div className="p-4 text-center">Loading Categories...</div>
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
  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 text-center">
        No categories found. Please select a restaurant.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-4">
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

      <ScrollArea className="flex-1 border rounded-md p-4">
        {loadingItems && allItems.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            Loading items...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                    {item.img || item.images.length > 0 ? (
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
                  <div className="font-medium text-sm line-clamp-2">
                    {item.name}
                  </div>
                  <div className="font-bold text-green-600">
                    ₹{item.price || item.cost_price || 0}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredItems.length === 0 && !loadingItems && (
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
