import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect } from 'react'
import { setCookie } from 'cookies-next'
import ShowAllDelycia from '@/components/all-delycias/ShowAllDelycia'

const searchSchema = z.object({
  table: z.any().optional(),
})

export const Route = createFileRoute('/delycias')({
  validateSearch: (search) => searchSchema.parse(search),
  component: DelyciasList,
})

function DelyciasList() {
  const searchParams = Route.useSearch()

  // Always clear restaurant data when visiting /delycias
  useEffect(() => {
    localStorage.removeItem('currentRestaurantUsername')
    console.log('[Delycias] Cleared restaurant data')
  }, [])

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

  // Always show restaurant listing on /delycias route
  return <ShowAllDelycia />
}
