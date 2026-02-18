import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useInventoryItems } from '@/hooks/useInventoryItems'
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'
import { Item, Variant } from '@/types/menu.types'
import LoadingScreen from '@/components/common/LoadingScreen'
import MenuGridItem from './MenuGridItem'

interface MenuSectionProps {
  addToCart: (item: Item, behavior?: 'add' | 'toggle') => void
  cart: any[]
}

// Simple fuzzy search helper
const fuzzyMatch = (text: string, term: string) => {
  if (!term) return true
  const t = text.toLowerCase()
  const q = term.toLowerCase()

  if (t.includes(q)) return true

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

export default function MenuSection({ addToCart, cart }: MenuSectionProps) {
  const { selectedRestaurant } = useRestaurantSelector()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  // Track which item is currently being customized (Inline Addon Selection)
  const [customizingItemId, setCustomizingItemId] = useState<string | null>(
    null,
  )

  const {
    data: categoriesData,
    isLoading: loadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategoriesQuery(selectedRestaurant?.id)

  const categories = categoriesData?.categories || []

  // Fetch all items from inventory
  const { allItems, loading: loadingItems } = useInventoryItems(null)

  // Derived filtered items
  const filteredItems = useMemo(() => {
    let result = allItems

    if (searchQuery.trim()) {
      result = allItems.filter((item) => fuzzyMatch(item.name, searchQuery))
    } else {
      if (selectedCategoryId !== 'all') {
        result = result.filter(
          (item) => item.category_id === selectedCategoryId,
        )
      }
    }

    return result
  }, [allItems, selectedCategoryId, searchQuery])

  // DIRECT ADD TO CART - NO DIALOG
  const onAddItem = (
    item: Item,
    variant?: Variant,
    addons: any[] = [],
    behavior: 'add' | 'toggle' = 'add',
  ) => {
    let uniqueId = variant ? `${item.id}_variant_${variant.id}` : `${item.id}`
    let finalPrice = variant
      ? variant.price
      : item.price || item.cost_price || 0
    let finalName = variant ? `${item.name} - ${variant.name}` : item.name

    // Store base name for billing
    const cartItemName = finalName

    // If addons selected, append to ID and Name, update Price
    if (addons.length > 0) {
      const sortedAddonIds = addons
        .map((a: any) => `${a.id}:${a.quantity || 1}`)
        .sort()
        .join('_')
      uniqueId = `${uniqueId}_addons_${sortedAddonIds}`

      const addonsPrice = addons.reduce(
        (sum: number, a: any) => sum + a.price * (a.quantity || 1),
        0,
      )
      finalPrice += addonsPrice

      const addonNames = addons
        .map((a: any) => (a.quantity > 1 ? `${a.name} x${a.quantity}` : a.name))
        .join(', ')
      finalName = `${finalName} (+ ${addonNames})`
    }

    const modifiedItem: Item = {
      ...item,
      id: uniqueId,
      name: finalName,
      cartItemName: cartItemName,
      price: finalPrice,
      variantId: variant?.id,
      addons: addons,
      category_id: item.category_id,
      is_active: item.is_active,
      is_veg: item.is_veg,
      description: item.description,
      image: item.image,
    }

    addToCart(modifiedItem, behavior)
    setCustomizingItemId(null)
  }

  // Handle errors and empty states
  if (categoriesError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        <p className="text-red-500 mb-4 font-medium">
          Failed to load categories
        </p>
        <Button onClick={() => refetchCategories()} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  if (
    !loadingCategories &&
    !loadingItems &&
    categoriesData !== undefined &&
    categories.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
        No categories found. Please select a restaurant.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-0 bg-background/50 rounded-lg">
      {/* Search and Category Filter Header - STICKY */}
      <div className="sticky top-[3.5rem] z-40 space-y-2 p-1 bg-background/95 backdrop-blur-md pb-3">
        {/* Search Bar - Modernized */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white border shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>

        {/* Categories - Pill Style */}
        <Tabs
          value={searchQuery ? 'all' : selectedCategoryId}
          onValueChange={(val) => {
            setSelectedCategoryId(val)
            if (val !== 'all' && searchQuery) setSearchQuery('')
          }}
          className="w-full "
        >
          <div className="w-full overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar scroll-smooth">
            <TabsList className="flex flex-nowrap bg-transparent gap-2 h-auto justify-start w-max no-scrollbar scroll-smooth">
              <TabsTrigger
                value="all"
                className="rounded-full px-3 py-2 border bg-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-gray-50 transition-all data-[state=active]:border-primary shrink-0"
              >
                All Items
              </TabsTrigger>
              {categories.map((cat: { id: string; name: string }) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-full px-3 py-2 border bg-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-gray-50 transition-all data-[state=active]:border-primary shrink-0"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Item Grid - Natural Scroll */}
      <div className="flex-1 pr-2">
        {loadingCategories || (loadingItems && allItems.length === 0) ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingScreen message="Loading Menu..." />
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 pb-10">
            {filteredItems.map((item) => (
              <MenuGridItem
                key={item.id}
                item={item}
                cart={cart}
                isCustomizing={customizingItemId === item.id}
                setCustomizingId={setCustomizingItemId}
                onAddItem={onAddItem}
              />
            ))}
            {filteredItems.length === 0 &&
              !loadingItems &&
              !loadingCategories && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mb-2 opacity-20" />
                  <p>No items found trying searching for something else.</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}
