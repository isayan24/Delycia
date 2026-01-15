import React from 'react'
import CategoryCard from './CategoryCard'
// import { fetchCategories } from "@/helpers/categories/fetchCategories"; // OLD - Replaced
import { useCategoriesQuery } from '@/hooks/queries' // NEW - TanStack Query
import { useRestaurantSelector } from '@/hooks/useRestaurantSelector'
import { HeaderSearch } from '../../header/HeaderSearch'
import useInventoryStore from '../main-file/UseInventoryStates'

export default function InventoryCategoryParent() {
  const { handleHighlightItem, handleNavigateToItem } = useInventoryStore()
  const { selectedRid } = useRestaurantSelector()

  // NEW - Use TanStack Query 🚀
  const { data: categoriesData } = useCategoriesQuery(selectedRid)
  const categories = categoriesData?.categories || []

  const handleSearch = (query: string) => {
    // Add search logic here if needed
  }

  return (
    <div className="space-y-4 p-10 max-w-[90rem] mx-auto max-[500px]:p-2 max-[500px]:mb-[4rem]">
      {categories?.map((category: any) => (
        <CategoryCard category={category} key={category.id} />
      ))}
    </div>
  )
}
