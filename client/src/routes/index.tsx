import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useRef, useState } from 'react'
import { setCookie } from 'cookies-next'
import ShowAllDelycia from '@/components/all-delycias/ShowAllDelycia'
import HomePage from '@/components/home/HomePage'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { submitCodeAutomatically } from '@/helpers/submitCodeAutomatically'

const searchSchema = z.object({
  table: z.any().optional(),
  code: z.any().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: Home,
})

function Home() {
  const searchParams = Route.useSearch()
  const { isAuthenticated, user } = useAuthQuery()
  const codeSubmissionAttempted = useRef(false)
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
    const { table, code } = searchParams

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

  // Automatic code submission when user becomes authenticated
  useEffect(() => {
    const handleCodeSubmission = async () => {
      if (isAuthenticated && user && !codeSubmissionAttempted.current) {
        codeSubmissionAttempted.current = true

        try {
          const result = await submitCodeAutomatically(user)

          if (result.success) {
            console.log('Home page: Code automatically submitted successfully')
          }
        } catch (error) {
          console.error(
            'Home page: Unhandled error during automatic code submission:',
            error,
          )
          codeSubmissionAttempted.current = false
        }
      }
    }

    handleCodeSubmission()
  }, [isAuthenticated, user])

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
    </div>
  )
}
