"use client";

import FoodItemCard from "@/components/restaurant/foodItem/FoodItemCard";
import React, { useEffect, useState, useCallback } from "react";
import { useItemStore } from "@/store/orderStore";
import { useParams } from "next/navigation";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { fetchCategory } from "@/helpers/fetchCategory";
import FoodSkeleton from "@/components/smallComponents/FoodSkeleton";
import { useRestaurantId } from "@/hooks/useRestaurantId";

interface Category {
  id: string;
  name: string;
}

export default function ItemName() {
  const params = useParams();
  const { itemName } = params as { itemName: string };
  const [category, setCategory] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<any | 0>(undefined);
  const rid = useRestaurantId();

  const refreshCategories = useCallback(async () => {
    try {
      const data = await fetchCategory(rid);
      setCategory(data.categories);
    } catch (err) {
      console.log("error in fetching category", err);
    }
  }, [rid]);

  useEffect(() => {
    if (rid !== null) {
      refreshCategories();
    }
  }, [rid, refreshCategories]);

  // Find the category ID when categories or itemName changes
  useEffect(() => {
    if (category.length > 0 && itemName) {
      const foundCategory = category.find(
        (item) => item.name.toLowerCase() === itemName
      );
      setCategoryId(foundCategory?.id);
    }
  }, [category, itemName]);

  const {
    items: foodItems,
    loading, 
  } = useInventoryItems(categoryId);
  const cartItems = useItemStore((state) => state.items);
  
  return (
    <div className="flex flex-wrap gap-4 mt-5 max-[700px]:flex-col max-w-[65rem] mx-auto justify-center">
      {loading ? (
        Array.from({ length: 8 }).map((_, index) => (
          <div className="min-h-[200rem]" key={`skeleton-${index}`}>
            <FoodSkeleton />
          </div>
        ))
      ) : (
        foodItems.map((item) => {
          const cartItem = cartItems.find(
            (cartItem) => cartItem.id === item.id
          );
          return (
            <FoodItemCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              images={item.images}
              category={item.category}
              quantity={cartItem?.quantity || 0}
              isVeg={item.is_veg}
              status={item.status}
              stock={item.stock}
            />
          );
        })
      )}
    </div>
  );
}
