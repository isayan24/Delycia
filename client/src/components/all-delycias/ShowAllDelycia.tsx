/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useRef } from 'react'
import ResCard from './ResCard'
import { useRestaurantsQuery } from '@/hooks/queries/useRestaurantsQuery'
import { useItemStore } from '@/store/order-store'
import { Utensils, Search, MapPin, Star } from 'lucide-react'
import { usePathname } from '@/lib/next-compat'

export default function ShowAllDelycia() {
  const { restaurants, loading, error } = useRestaurantsQuery()
  const { clearAll } = useItemStore()

  // console.log(loading, restaurants, 'restaurants')

  const pathname = usePathname()

  const hasCleared = useRef(false)

  useEffect(() => {
    if (pathname === '/delycias' && !hasCleared.current) {
      clearAll()
      hasCleared.current = true
      console.log('✅ Cart cleared successfully')
    }
  }, [pathname, clearAll])

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse w-full max-w-sm mx-auto">
      {/* Status badges skeleton */}
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="absolute top-4 left-4 z-10">
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>

        {/* Image skeleton */}
        <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 sm:p-6">
        {/* Restaurant name */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>

        {/* Location */}
        <div className="flex items-center mb-3">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Rating and stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        {/* Enhanced Hero Section with Banner Background - Loading State */}
        <div className="relative overflow-hidden h-[35vh] min-h-[280px]">
          {/* Banner Background with Loading Animation */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-400 to-purple-500 animate-pulse"></div>
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Animated Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-pulse">
                  <Utensils className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="h-8 bg-white/20 rounded-lg w-80 mx-auto mb-3 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded-lg w-56 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex justify-center">
                <SkeletonCard />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600">
            Unable to load restaurants. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-[700px]:pb-4 bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Compact Hero Section with Beautiful Banner Background */}
      <div className="relative overflow-hidden h-[40vh] min-h-[320px]">
        {/* Multi-layered Banner Background */}
        <div className="absolute inset-0">
          {/* Base Banner Image */}
          <img
            src="./images/banner.jpg"
            alt="Restaurant Banner"
            className="w-full h-full object-cover scale-110 blur-[1px]"
          />

          {/* Multiple Gradient Overlays for Depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/40 via-transparent to-red-500/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-orange-400/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-red-900/30"></div>
        </div>

        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-orange-300/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-red-300/30 rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-300/40 rounded-full animate-bounce delay-700"></div>
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center text-center">
          <div className="text-white space-y-4">
            {/* Animated Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-4 shadow-2xl border border-white/30 transform hover:scale-110 transition-all duration-300">
                <Utensils className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Main Heading with Gradient Text Effect - Smaller */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  Discover Amazing
                </span>
                <span className="block text-yellow-300 drop-shadow-2xl mt-1 animate-pulse">
                  Restaurants
                </span>
              </h1>

              <p className="text-base md:text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                Explore delicious cuisines from the best restaurants in your
                area
              </p>
            </div>

            {/* Feature Stats with Icons - Smaller and Responsive */}
            <div className="flex justify-center items-center space-x-4 md:space-x-6 mt-8">
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 border border-white/20">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium text-sm">Premium</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 border border-white/20">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-white font-medium text-sm">Local</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full px-3 py-2 border border-white/20">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium text-sm">
                  Discovery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fade Effect */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-orange-50 to-transparent"></div> */}
      </div>

      {/* Restaurant Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {restaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">
              No restaurants found
            </h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              Check back later for new restaurants in your area.
            </p>
          </div>
        ) : (
          <>
            {/* Section Header - Smaller */}
            <div className="text-center mb-5">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                Featured <span className="text-orange-500">Restaurants</span>
              </h2>
              <div className="mt-4 w-20 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full"></div>
            </div>

            {/* Restaurant Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {restaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="flex justify-center transform hover:scale-105 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                  }}
                >
                  <ResCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Additional CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
