import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect } from 'react'
import { setCookie } from 'cookies-next'

const searchSchema = z.object({
  table: z.any().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: Home,
})

function Home() {
  const searchParams = Route.useSearch()
  const navigate = Route.useNavigate()

  // Check if restaurant username exists in storage and redirect
  useEffect(() => {
    const storedUsername = localStorage.getItem('currentRestaurantUsername')

    if (storedUsername) {
      console.log(
        '[Home] Found username in storage, redirecting to:',
        storedUsername,
      )
      navigate({ to: '/$username', params: { username: storedUsername } })
    } else {
      console.log('[Home] No username in storage, redirecting to /delycias')
      navigate({ to: '/delycias' })
    }
  }, [navigate])

  useEffect(() => {
    const { table } = searchParams

    // Handle table parameter
    if (table) {
      setCookie('table', table, {
        maxAge: 7200, // 2 hours in seconds
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    }
  }, [searchParams])

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
    </div>
  )
}
