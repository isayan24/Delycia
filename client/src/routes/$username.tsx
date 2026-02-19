import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect } from 'react'
import { setCookie } from 'cookies-next'
import HomePage from '@/components/home/HomePage'
import { fetchRestaurantByUsername } from '@/hooks/queries/useRestaurantsQuery'

const searchSchema = z.object({
  table: z.any().optional(),
})

export const Route = createFileRoute('/$username')({
  validateSearch: searchSchema,
  beforeLoad: ({ params }) => {
    const { username } = params
    // Exclude static assets and known routes from username matching
    const excludedPatterns = [
      /\.(css|js|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|mp3|wav|mp4|webm)$/i,
      /^(api|assets|public|_|__)/i,
    ]

    if (excludedPatterns.some((pattern) => pattern.test(username))) {
      throw new Error('Invalid route')
    }
  },
  loader: async ({ params }) => {
    const { username } = params

    try {
      const restaurant = await fetchRestaurantByUsername(username)

      if (!restaurant) {
        throw new Error('Restaurant not found')
      }

      return { restaurant }
    } catch (error) {
      throw new Error(`Restaurant not found: ${username}`)
    }
  },
  component: UsernameMenuPage,
  pendingComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading menu...</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Restaurant Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          {error.message || "The restaurant you're looking for doesn't exist."}
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-block"
        >
          View All Restaurants
        </a>
      </div>
    </div>
  ),
})

function UsernameMenuPage() {
  const searchParams = Route.useSearch()
  const { restaurant } = Route.useLoaderData()

  // Store username in localStorage (persists across tabs/sessions)
  useEffect(() => {
    if (restaurant?.username) {
      localStorage.setItem('currentRestaurantUsername', restaurant.username)
    }
  }, [restaurant])

  // Handle table parameters
  useEffect(() => {
    const { table } = searchParams
    if (table) {
      setCookie('table', table, {
        maxAge: 7200,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    }
  }, [searchParams])

  return <HomePage />
}
