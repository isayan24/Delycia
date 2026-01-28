import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useState, useRef } from 'react'
import { setCookie, getCookie } from 'cookies-next'
import HomePage from '@/components/home/HomePage'
import ShowAllDelycia from '@/components/all-delycias/ShowAllDelycia'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { submitCodeAutomatically } from '@/helpers/submitCodeAutomatically'

const searchSchema = z.object({
  rid: z.any().optional(),
  table: z.any().optional(),
  code: z.any().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: Home,
})

function Home() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()
  const [currentRid, setCurrentRid] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated, user } = useAuthQuery()
  const codeSubmissionAttempted = useRef(false)

  useEffect(() => {
    const { rid, table, code } = searchParams
    const existingRid = getCookie('rid')

    // Set code when the digital qr alive cookies for URL parameters
    if (code) {
      setCookie('code', code, {
        maxAge: 7200, // 2 hour in seconds
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    }

    // Check rid first - either from URL or cookie
    if (rid) {
      setCookie('rid', rid, {
        maxAge: 7 * 24 * 3600, // 7 days in seconds
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      setCurrentRid(rid)
    } else if (existingRid) {
      // If no rid in URL but exists in cookie, update URL
      navigate({
        to: '/',
        search: {
          ...searchParams,
          rid: existingRid.toString(),
        },
        replace: true,
      })
      setCurrentRid(existingRid.toString())
    } else {
      setCurrentRid(null)
    }

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

    // Set loading to false after checking is complete
    setIsLoading(false)
  }, [searchParams, navigate])

  // Automatic code submission when user becomes authenticated
  useEffect(() => {
    const handleCodeSubmission = async () => {
      // Only attempt submission if user is authenticated, has user data, and we haven't already attempted
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

  // Show loading state while checking rid
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return currentRid ? <HomePage /> : <ShowAllDelycia />
}
