'use client'

import FoodItemCard from '@/components/restaurant/foodItem/FoodItemCard'
import React, { useEffect, useState } from 'react'
import { useItemStore } from '@/store/order-store'
import { useInventoryQuery } from '@/hooks/queries/useInventoryQuery'
import { AlertTriangle } from 'lucide-react'
import FoodSkeleton from '../smallComponents/FoodSkeleton'
import NoFoodBox from './NoFoodBox'

export default function HomeCategoryItems({
  itemCategoryId,
}: {
  itemCategoryId?: string
}) {
  const {
    items: foodItems,
    loading,
    error,
    refetch,
  } = useInventoryQuery(itemCategoryId)
  const cartItems = useItemStore((state) => state.items)

  useEffect(() => {
    useItemStore.persist.rehydrate()
  }, [])

  // Error component
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center mt-[8rem]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Failed to load items</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  // No items component
  if (!loading && foodItems.length === 0) {
    return <NoFoodBox refetch={refetch} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 max-[700px]:flex max-[700px]:flex-col max-[700px]:gap-2 max-[700px]:px-2 ">
      {loading
        ? // Display skeletons when loading
          Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="max-[700px]:mx-auto">
              <FoodSkeleton />
            </div>
          ))
        : // Display actual items when loaded
          foodItems
            .filter((i: any) => i?.status !== 'out_of_stock')
            .map((item: any) => {
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
                  images={item.images}
                  category={item.category_id}
                  quantity={cartItem?.quantity || 0}
                  isVeg={item.is_veg}
                  status={item.status}
                  stock={item.stock}
                />
              )
            })}
    </div>
  )
}
