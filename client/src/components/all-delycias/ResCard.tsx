/* eslint-disable @next/next/no-img-element */
'use client'
import { Restaurant } from '@/types/Restaurant'
import { MapPin, ChefHat, Heart } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { ImageLoader } from '../image-loader'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from '@/lib/next-compat'
import { Link } from '@tanstack/react-router'
// import Banner from "../../../public/";

export default function ResCard({ restaurant }: { restaurant: Restaurant }) {
  const [isClicked, setIsClicked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Load like state from localStorage on component mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedRestaurants')
    if (savedLikes) {
      try {
        const likedRestaurants = JSON.parse(savedLikes)
        setIsLiked(likedRestaurants.includes(restaurant.id))
      } catch (error) {
        console.error(
          'Error parsing liked restaurants from localStorage:',
          error,
        )
      }
    }
  }, [restaurant.id])

  // Save like state to localStorage
  const saveLikeState = (liked: boolean) => {
    try {
      const savedLikes = localStorage.getItem('likedRestaurants')
      let likedRestaurants: any[] = []

      if (savedLikes) {
        likedRestaurants = JSON.parse(savedLikes)
      }

      if (liked) {
        // Add restaurant ID if not already in the array
        if (!likedRestaurants.includes(restaurant.id)) {
          likedRestaurants.push(restaurant.id)
        }
      } else {
        // Remove restaurant ID from the array
        likedRestaurants = likedRestaurants.filter((id) => id !== restaurant.id)
      }

      localStorage.setItem('likedRestaurants', JSON.stringify(likedRestaurants))
    } catch (error) {
      console.error('Error saving liked restaurants to localStorage:', error)
    }
  }

  const handleCardClick = async (e: React.MouseEvent) => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 300)

    if (isAuthenticated) {
      // Session check if needed
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    saveLikeState(newLikedState)
  }

  const handleViewMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/?rid=${restaurant.id}`)
  }

  return (
    <Link
      to={`/res/${restaurant.username || restaurant.id}?id=${restaurant.id}`}
      onClick={handleCardClick}
      className={`group block !overflow-hidden rounded-2xl w-full max-w-sm mx-auto shadow-md transform transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 touch-manipulation ${
        isClicked ? 'scale-[0.98] translate-y-1' : ''
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl border border-gray-100 group-hover:border-orange-200 w-full relative ${
          isClicked ? 'shadow-2xl border-orange-300 bg-orange-50/30' : ''
        }`}
      >
        {/* Glassmorphism Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div
            className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md border transition-all duration-300 ${
              restaurant.is_active
                ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/25'
                : 'bg-red-500/90 text-white border-red-400/50 shadow-red-500/25'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                restaurant.is_active ? 'bg-emerald-200' : 'bg-red-200'
              }`}
            ></div>
            {restaurant.is_active ? 'Open Now' : 'Closed'}
          </div>
        </div>

        {/* Like Button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={handleLikeClick}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl border border-white/50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                isLiked
                  ? 'text-red-500 fill-red-500 scale-110'
                  : 'text-gray-400 hover:text-red-400'
              }`}
            />
          </button>
        </div>

        {/* Image Container with Banner Background */}
        <div className="relative h-40 sm:h-48 overflow-hidden">
          {/* mark Banner Background Image with Blur */}
          {true ? (
            <div className="absolute inset-0">
              {/* <ImageLoader
                objectFit="cover"
                height={192}
                width={384}
                src={restaurant.banner}
                alt={`${restaurant.name} Banner`}
                className="w-full h-full object-cover blur-sm scale-110" // blur-md for blur effect, scale-110 to prevent blur edges
              /> */}
              <img
                src={'./images/restaurant-banner.jpg'}
                alt={`${restaurant.name} Banner`}
                className="w-full h-full object-cover blur-[2px] scale-110" // blur-md for blur effect, scale-110 to prevent blur edges
              />
              {/* Dark fade overlay */}
              <div className="absolute inset-0 bg-[#0303030e]"></div>
            </div>
          ) : (
            // Fallback gradient background if no banner
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100"></div>
          )}

          {/* Logo Container */}
          <div className="relative z-10 h-full flex items-center justify-center">
            {restaurant.logo ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-xl border-4 border-white group-hover:border-orange-200 transition-all duration-300">
                {/* <ImageLoader
                  objectFit="cover"
                  height={100}
                  width={100}
                  src={restaurant.logo}
                  alt={`${restaurant.name} Logo`}
                  className="transition-transform duration-300 group-hover:scale-110 w-full h-full"
                /> */}
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center shadow-xl border-4 border-white group-hover:border-orange-200 transition-all duration-300">
                <ChefHat className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            )}
          </div>

          {/* Additional gradient overlay for better logo visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-6">
          {/* Restaurant Name */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
            {restaurant.name || 'Restaurant'}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {restaurant.address
                ? `${restaurant.address}, ${restaurant.city}`
                : restaurant.city}
            </span>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">@{restaurant.username}</div>

            <button
              onClick={handleViewMenuClick}
              className={`bg-gradient-to-r from-orange-500 to-orange-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300 shadow-lg min-h-[44px] flex items-center justify-center `}
            >
              View Menu
            </button>
          </div>
        </div>

        {/* Hover and Click Effect Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
            isClicked ? 'opacity-100 from-orange-500/10' : ''
          }`}
        ></div>

        {/* Click Ripple Effect */}
        {isClicked && (
          <div className="absolute inset-0 bg-orange-500/10 rounded-2xl animate-pulse pointer-events-none"></div>
        )}

        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
      </div>
    </Link>
  )
}
