/* eslint-disable @next/next/no-img-element */
'use client'
import React from 'react'
import { usePathname, useSearchParams } from '@/lib/next-compat'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useItemStore } from '@/store/order-store'
import { getUser } from '@/helpers/getUser'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { ImageLoader } from '../image-loader'
import { useLoginDialogStore } from '@/store/useLoginDialogStore'
import { LogIn, LogOut, User } from 'lucide-react'
import { useRestaurantUsername } from '@/hooks/useRestaurantUsername'
import { Link } from '@tanstack/react-router'

export default function Header() {
  const pathname = usePathname()
  const showCartItems = useItemStore((state) => state.items)
  const isMobile = useMediaQuery('(max-width: 700px)', false)
  const is800px = useMediaQuery('(max-width: 800px)', false)
  const searchParams = useSearchParams()
  const restaurantUsername = useRestaurantUsername()

  const { user, logout, isAuthenticated } = useAuthQuery()
  const { openLoginDialog } = useLoginDialogStore()

  const [userData, setUserData] = React.useState<{
    username?: string
    name?: any
    profile_pic?: string
  } | null>(null)

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUser()
        if (data?.user) {
          setUserData(data.user)
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  // Don't show header on category pages
  // if (
  //   pathname.startsWith("/category") ||
  //   pathname.startsWith("/delycias") ||
  //   pathname.startsWith("/res") ||
  //   pathname === "/"
  // ) {
  //   return null;
  // }

  const hasParams = searchParams.toString().length > 0

  if (
    pathname.startsWith('/category') ||
    pathname.startsWith('/delycias') ||
    pathname.startsWith('/res') ||
    (pathname === '/' && !hasParams)
  ) {
    return null
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      href: restaurantUsername ? `/${restaurantUsername}` : '/',
    },
    {
      id: 'delycias',
      label: 'All Delycias',
      icon: '🍽️',
      href: '/delycias',
    },
    { id: 'orders', label: 'Orders', icon: '📦', href: '/orders' },
  ]

  const home =
    pathname === '/' ||
    (restaurantUsername && pathname === `/${restaurantUsername}`)

  return (
    <header
      className={`${isMobile && 'hidden'} ${home ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 h-16 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg`}
    >
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Logo Section - Left */}
        <Link
          to={restaurantUsername ? '/$username' : '/'}
          params={
            restaurantUsername ? { username: restaurantUsername } : undefined
          }
          className="flex items-center space-x-4"
        >
          <div
            className={`w-10 h-10 bg-gradient-to-br ${home ? 'from-green-400 to-green-600' : 'from-orange-400 to-orange-600'}  rounded-xl flex items-center justify-center shadow-lg`}
          >
            <img
              src="/delycia-logo-white.png"
              alt="logo"
              className="w-14 h-12"
            />
          </div>
        </Link>

        {/*Navigation - Center */}
        <nav className="flex items-center space-x-1 bg-white/20 rounded-full p-1 backdrop-blur-sm border border-white/30">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                to={item.href as any}
                className={`${is800px ? 'space-x-2 px-2' : 'space-x-2 px-4'} flex items-center py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? !home
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-green-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-white/30 hover:text-green-600'
                }`}
              >
                <span className={`${is800px ? 'text-sm' : 'text-md'}`}>
                  {item.icon}
                </span>
                <span className={`${is800px ? 'text-sm' : 'text-md'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Profile Section - Right */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 21H21M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-8 4h4"
              />
            </svg>
            <span
              className={`absolute -top-1 -right-1 w-5 h-5 ${home ? 'bg-green-400' : 'bg-orange-400'} rounded-full flex items-center justify-center text-white text-xs font-bold`}
            >
              {showCartItems.length}
            </span>
          </Link>

          {/* mark Profile */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300">
              <div
                className={`bg-gradient-to-br ${home ? 'from-green-400 to-green-600' : 'from-orange-400 to-orange-600'} rounded-full flex items-center justify-center`}
              >
                {userData?.profile_pic ? (
                  <ImageLoader
                    src={userData?.profile_pic}
                    alt="user"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm w-8 h-8 flex justify-center items-center">
                    {userData?.name?.[0] ? userData?.name?.[0] : 'G'}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-gray-700 font-medium">
                {userData?.name || 'Guest'}
              </span>
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
              <div className="p-2">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/user/p"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-gray-700">Profile</span>
                    </Link>
                    <hr className="my-2 border-gray-200" />
                  </>
                )}

                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={openLoginDialog}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
