import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect, useRef } from 'react'
import { setCookie } from 'cookies-next'
import ShowAllDelycia from '@/components/all-delycias/ShowAllDelycia'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { submitCodeAutomatically } from '@/helpers/submitCodeAutomatically'

const searchSchema = z.object({
  table: z.any().optional(),
  code: z.any().optional(),
})

export const Route = createFileRoute('/delycias')({
  validateSearch: (search) => searchSchema.parse(search),
  component: DelyciasList,
})

function DelyciasList() {
  const searchParams = Route.useSearch()
  const { isAuthenticated, user } = useAuthQuery()
  const codeSubmissionAttempted = useRef(false)

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

  // Automatic code submission when user becomes authenticated
  useEffect(() => {
    const handleCodeSubmission = async () => {
      if (isAuthenticated && user && !codeSubmissionAttempted.current) {
        codeSubmissionAttempted.current = true

        try {
          const result = await submitCodeAutomatically(user)

          if (result.success) {
            console.log('Delycias page: Code automatically submitted successfully')
          }
        } catch (error) {
          console.error(
            'Delycias page: Unhandled error during automatic code submission:',
            error,
          )
          codeSubmissionAttempted.current = false
        }
      }
    }

    handleCodeSubmission()
  }, [isAuthenticated, user])

  // Always show restaurant listing on /delycias route
  return <ShowAllDelycia />
}
