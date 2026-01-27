/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useCallback, useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import HomeCategoryItems from './HomeCategoryItems'
import AllCategoryItems from './AllCategoryItems'
import HeaderHero from '../header/HeaderHero'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery'
import UseOptimizeImage from '@/hooks/UseOptimizeImage'
// import allFood from '../../../public/allFood.png'
// import Image from '@/lib/next-compat'
import HeaderSearch from '../header/HeaderSearch'

export default function HomePageFilter() {
  const { categories: category, loading: isLoading } = useCategoriesQuery()
  const isMobile = useMediaQuery('(max-width: 700px)', false)
  const isLargeScreen = useMediaQuery('(min-width: 1151px)', false)
  // const rid = useRestaurantId() // handled inside hook
  const [activeTab, setActiveTab] = useState('All') // Add active tab state

  // Removed manual fetch logic (refreshCategories, useLayoutEffect)
  // useCategoriesQuery handles it.

  const handleTabSwitch = useCallback(
    (categoryName: string) => {
      if (!categoryName) {
        setActiveTab('All')
        return
      }

      // Find the category that matches the name
      const matchedCategory: any = category.find(
        (cat: any) => cat.name.toLowerCase() === categoryName.toLowerCase(),
      )

      if (matchedCategory) {
        setActiveTab(matchedCategory.name)
      } else {
        // If no exact match, default to "All"
        setActiveTab('All')
      }
    },
    [category],
  )

  const handleItemSelect = useCallback(
    async (_itemId?: string, _categoryId?: string, categoryName?: string) => {
      if (handleTabSwitch && categoryName) {
        handleTabSwitch(categoryName)
      }
    },
    [handleTabSwitch],
  )

  // Memoize desktop category tabs to prevent unnecessary re-renders
  const desktopCategoryTabs = useMemo(() => {
    return (
      <TabsList className="w-full bg-transparent  pb-2 h-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <TabsTrigger
          value="All"
          className="bg-white !overflow-hidden !rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer data-[state=active]:bg-orange-50 data-[state=active]:border-orange-200 h-auto"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <img
              src="/allFood.png"
              alt="All Food"
              className="h-full w-full object-cover rounded-lg"
              // width={80}
              // height={80}
            />
          </div>
          <div className="text-center">
            <h3 className="font-[500] text-gray-900 text-[1rem]">All Items</h3>
            <p className="text-xs text-gray-500 mt-1">Everything</p>
          </div>
        </TabsTrigger>

        {category.map((link: any) => (
          <TabsTrigger
            key={link.id}
            value={link.name}
            className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer data-[state=active]:bg-orange-50 data-[state=active]:border-orange-200 h-auto"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              {/* <UseOptimizeImage
                src={link.img}
                alt={link.name}
                rounded="rounded-xl"
                width={48}
                height={48}
                className="object-cover"
              /> */}
              <img src={link.img} alt={link.name} />
            </div>
            <div className="text-center">
              <h3 className="font-[500] text-gray-900 text-[1rem]">
                {link.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Fresh & Quality</p>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    )
  }, [category])

  // Memoize category tabs to prevent unnecessary re-renders
  const categoryTabs = useMemo(() => {
    return category.map((cat: any) => (
      <div key={cat.id}>
        <TabsContent value={cat.name}>
          <HomeCategoryItems itemCategoryId={cat.id} />
        </TabsContent>
      </div>
    ))
  }, [category])

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="All"
        className="w-full"
      >
        {/* Mobile header */}
        <div className="max-[700px]:block hidden">
          <HeaderHero category={category} onTabSwitch={handleTabSwitch} />
        </div>

        {/*mark Desktop hero section */}
        <div
          className={`${isMobile && 'hidden'} bg-gradient-to-br from-green-600 to-green-700 text-white`}
        >
          <div className="max-w-7xl mx-auto px-4 py-16">
            {/* Search Section for Desktop */}
            <div className="mb-12">
              <HeaderSearch onItemSelect={handleItemSelect} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6 leading-tight text-nowrap">
                  Order your favorite meals
                  <br />
                  <span className="text-green-300">with just a tap</span>
                </h1>
                <p className="text-lg text-green-200 mb-8 leading-relaxed">
                  Browse digital menus, reserve tables,
                  <br />
                  and enjoy food delivered right to your seat or home.
                </p>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 500, behavior: 'smooth' })
                  }
                  className="bg-green-400 hover:bg-green-300 text-green-900 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Order now
                </button>
              </div>
              <div className={`relative ${isLargeScreen ? '' : 'hidden'}`}>
                <div className="w-80 h-80 bg-green-500 rounded-3xl mx-auto relative overflow-hidden">
                  {/* Placeholder for grocery bag illustration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <div className="text-6xl">
                      <img
                        src="/images/home-page-cart-pic.jpeg"
                        alt="Grocery bag illustration"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Category Tabs */}
            <div className="mt-16">
              <div className="max-w-7xl mx-auto px-4">
                {desktopCategoryTabs}
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="min-h-screen">
          <div className={`${isMobile ? 'pt-[11rem]' : ''} `}>
            {categoryTabs.map((tab, index) => (
              <div key={index} className={`${isMobile ? '' : 'py-2'} `}>
                {tab}
              </div>
            ))}
          </div>

          <div className={`${isMobile ? 'pt-[1rem]' : 'py-2'}`}>
            <TabsContent value="All">
              <div className={`${isMobile ? '' : 'py-2'}`}>
                <AllCategoryItems />
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
