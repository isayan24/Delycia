'use client'

import FoodItemCard from '@/components/restaurant/foodItem/FoodItemCard'
import React, { useEffect } from 'react'
import { useItemStore } from '@/store/order-store'
import { useAllInventoryQuery } from '@/hooks/queries/useInventoryQuery'
import { AlertTriangle } from 'lucide-react'
import FoodSkeleton from '../smallComponents/FoodSkeleton'
import NoFoodBox from './NoFoodBox'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'
import { useRestaurantId } from '@/hooks/useRestaurantId'
import { ImageLoader } from '../image-loader'

export default function AllCategoryItems({
  itemCategoryId,
}: {
  itemCategoryId?: string
}) {
  const { categories, loading: categoriesLoading } = useCategoriesQuery()
  const {
    allItems,
    fetchAllItems,
    error,
    loading: inventoryLoading,
  } = useAllInventoryQuery()

  const cartItems = useItemStore((state) => state.items)
  const rid = useRestaurantId()

  const isLoading = inventoryLoading || categoriesLoading

  useEffect(() => {
    useItemStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    if (rid !== null) {
      fetchAllItems()
    }
  }, [rid, fetchAllItems])

  // Group items by category
  const groupedItems = React.useMemo(() => {
    if (!allItems.length || !categories.length) return {}

    const grouped: { [key: string]: any } = {}

    categories.forEach((category) => {
      const categoryItems = allItems.filter(
        (item: any) =>
          item.category_id === category.id && item.status !== 'out_of_stock',
      )
      if (categoryItems.length > 0) {
        grouped[category.id] = {
          category,
          items: categoryItems,
        }
      }
    })

    return grouped
  }, [allItems, categories])

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load items</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => fetchAllItems()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Empty state
  if (!isLoading && allItems.length === 0) {
    return <NoFoodBox refetch={fetchAllItems} />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-[700px]:flex max-[700px]:flex-col max-[700px]:gap-3 max-[700px]:px-0">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="max-[700px]:mx-auto">
              <FoodSkeleton />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-2">
      {Object.values(groupedItems).map(({ category, items }: any) => (
        <div key={category.id} className="mb-12">
          {/* Category Header */}
          <div className="flex items-center justify-between mb-6 max-[700px]:hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <ImageLoader
                  src={category.img}
                  alt={category.name}
                  className="object-cover rounded-lg"
                  width={48}
                  height={48}
                />
              </div>
              <div>
                <h2 className="text-2xl  font-bold text-gray-900">
                  {category.name}
                </h2>
                <p className="text-gray-500">{items.length} items available</p>
              </div>
            </div>
          </div>

          {/* Mobile Category Header */}
          <div className="min-[700px]:hidden mb-4 flex gap-2 items-center">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden">
              <ImageLoader
                src={category.img}
                alt={category.name}
                className="object-cover rounded-md"
                width={40}
                height={30}
              />
            </div>
            <h2 className="text-lg font-bold text-gray-900 ">
              {category.name}
            </h2>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-[700px]:flex max-[700px]:flex-col max-[700px]:gap-3">
            {items.slice(0, 8).map((item: any) => {
              const cartItem = cartItems.find(
                (cartItem) => cartItem.id === item.id,
              )
              return (
                <FoodItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  images={item.images || null}
                  category={item.category_id}
                  quantity={cartItem?.quantity || 0}
                  isVeg={item.is_veg}
                  status={item.status}
                  stock={item.stock}
                />
              )
            })}
          </div>
        </div>
      ))}

      {/* You might need section */}
      {Object.keys(groupedItems).length > 0 && (
        <div className="mb-12 max-[700px]:hidden">
          {/* Show random items from different categories */}
          <div>
            <h3 className="text-xl font-bold mb-4">Most Popular Choices</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.values(groupedItems)
              .flatMap(({ items }: any) => items)
              .sort(() => Math.random() - 0.5)
              .slice(0, 4)
              .map((item: any) => {
                const cartItem = cartItems.find(
                  (cartItem) => cartItem.id === item.id,
                )
                return (
                  <FoodItemCard
                    key={`suggested-${item.id}`}
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    images={item.images || null}
                    category={item.category_id}
                    quantity={cartItem?.quantity || 0}
                    isVeg={item.is_veg}
                    status={item.status}
                    stock={item.stock}
                  />
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
